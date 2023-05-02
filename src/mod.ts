import { Application, Router } from "./deps.ts";
import { audio, liveFlv, video } from "./modules/mod.ts";

const app = new Application();
const router = new Router();

router.get("/video", video);
router.get("/audio", audio);
router.get("/live", liveFlv);

app.use(async (ctx, next) => {
    console.log(`${ctx.request.ip} ${ctx.request.method} ${ctx.request.url}`)
    await next();
});
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 7788 });
