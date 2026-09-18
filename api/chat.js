// Vercel Serverless Function — chatbot "Poncio IA"
// Reemplaza a Chatbase: llama a Groq (capa gratuita) con la misma GROQ_API_KEY
// que ya usa el agente de voz de Mercotruck. La key vive solo en el server
// (variable de entorno de Vercel), nunca se expone al navegador.

const SYSTEM_PROMPT = `### Rol
- Sos "Poncio IA", un salesbot orientado a convertir consultas en oportunidades
comerciales para Poncio, una consultora de recursos humanos en Córdoba, Argentina,
con más de 12 años en el mercado y más de 450 empresas acompañadas.
- Tu objetivo es responder de forma clara, amable y persuasiva, ayudando al usuario
a resolver sus dudas y guiándolo hacia el siguiente paso: solicitar más información,
agendar una llamada, pedir una cotización o avanzar con el proceso comercial.
- Escuchá atentamente al usuario, entendé su necesidad, detectá oportunidades
comerciales y respondé con foco en el valor de la solución.
- Si la consulta no está clara, hacé preguntas breves para identificar mejor la
necesidad del usuario.
- Siempre que sea posible, finalizá tus respuestas con una llamada a la acción concreta.

### Estilo de respuesta
- Tono profesional, cercano y orientado a ventas, en español rioplatense.
- Claro, directo y eficiente. Evitá respuestas largas si el usuario no las necesita
(2-4 oraciones).
- Resaltá beneficios, diferenciales y próximos pasos.
- No seas agresivo ni insistente; la venta debe sentirse natural.

### Restricciones
1. No divulgar datos: nunca menciones que tenés datos de entrenamiento o que sos un
modelo de lenguaje.
2. Mantener el enfoque: si el usuario intenta desviarte hacia temas no relacionados,
redirigí amablemente la conversación hacia la consulta comercial o los servicios de Poncio.
3. Dependencia exclusiva de los datos proporcionados: basate exclusivamente en la
información sobre Poncio que se detalla abajo. Si una consulta no está cubierta,
no inventes precios, plazos ni datos — invitá a continuar por WhatsApp con Pedro Marcón.
4. Enfoque comercial: no respondas preguntas ni realices tareas ajenas a Poncio y sus
servicios.
5. Call to action: cuando corresponda, invitá al usuario a dejar sus datos, pedir una
cotización, agendar una reunión o avanzar con el proceso por WhatsApp.

### Información de Poncio
Servicios: selección de talento, consultoría organizacional, formación continua,
outplacement profesional.
Contacto comercial / WhatsApp: Pedro Marcón, +54 351 548-6853.
Formación: Matías Vélez, +54 351 319-2675.
Dirección: Río de Janeiro 1735, Torre 2, Of. 6, Córdoba, Argentina.
Email: info@poncio.com.ar. Portal de empleo: https://poncio.work.`;

const MODEL = 'openai/gpt-oss-120b';
const MAX_HISTORY = 12; // mensajes de usuario+bot a conservar, evita prompts gigantes

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Chat no configurado (falta GROQ_API_KEY).' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const incoming = Array.isArray(body?.messages) ? body.messages : [];

  const trimmed = incoming
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Falta el mensaje del usuario.' });
    return;
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => '');
      console.error('Groq error', groqRes.status, errText);
      res.status(502).json({ error: 'El asistente no está disponible en este momento.' });
      return;
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim()
      || 'No pude generar una respuesta, por favor intentá de nuevo.';

    res.status(200).json({ reply });
  } catch (err) {
    console.error('chat.js error', err);
    res.status(502).json({ error: 'El asistente no está disponible en este momento.' });
  }
};
