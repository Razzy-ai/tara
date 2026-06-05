export function makeSchema(jsonSchema: any, defaults: Record<string, any> = {}) {
  // Mastra checks for these specific properties to detect Zod schemas
  // We need to make it look like a pre-serialized schema, not a Zod object
  
  const cleanSchema = { ...jsonSchema };

  const schema: any = {
    // These fool Mastra into thinking it's already serialized
    _type: "json_schema",
    isSchema: true,

    // The actual JSON schema Mastra/AI SDK should send to Groq
    jsonSchema: cleanSchema,

    // Zod-compatible interface
    parse: (data: any) => ({ ...defaults, ...data }),
    safeParse: (data: any) => ({ success: true, data: { ...defaults, ...data } }),
    parseAsync: async (data: any) => ({ ...defaults, ...data }),

    // Override toJSON so JSON.stringify returns clean schema
    toJSON: () => cleanSchema,

    // This is what @ai-sdk uses internally
    parameters: cleanSchema,

    // Prevent Mastra's zodToJsonSchema from running on this
    _def: {
      typeName: "ZodEffects",  // not ZodObject — avoids Mastra's schema walker
    },

    // Direct schema properties — last so they don't override above
    ...cleanSchema,
  };

  return schema;
}