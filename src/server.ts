import Fastify from "fastify";

const buildApp = () => {
  const app = Fastify();

  app.get("/", async (request, reply) => {
    return { message: "Hello, world!" };
  });

  return app;
};

if (require.main === module) {
  const app = buildApp();
  app.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

export default buildApp;
