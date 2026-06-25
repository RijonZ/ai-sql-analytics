const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { columns, fileName } = req.body;

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return res.status(400).json({ error: 'Columns are required.' });
  }

  try {
    const schemaDesc = columns.map(c => `${c.column_name} (${c.data_type})`).join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a data analyst. Given a dataset schema, generate exactly 8 short and specific analytical questions a user might ask about this data. Return ONLY a valid JSON object with a "suggestions" key containing an array of 8 strings. Questions must be relevant to the actual column names provided.`,
        },
        {
          role: 'user',
          content: `Dataset file: ${fileName}\nColumns: ${schemaDesc}\n\nGenerate 8 relevant questions for this dataset.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    const suggestions = parsed.suggestions || parsed.questions || Object.values(parsed)[0];

    res.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 8) : [] });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
