import { COOKIES } from "../constant.ts";
import { Context, Middleware } from "../deps.ts";

export const liveFlv: Middleware = async (ctx: Context) => {
  const query = ctx.request.url.searchParams;
  const room = query.get("room");
  if (!room) {
    ctx.response.status = 400;
    ctx.response.body = {
      message: "room is required",
    };
    return;
  }
  const roomInfoJson = await fetch(
    `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${room}`,
    {
      headers: {
        Referer: "https://live.bilibili.com/",
        Cookie: COOKIES,
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
      },
    },
  );
  const roomInfo = await roomInfoJson.json();
  if (roomInfo.code !== 0) {
    ctx.response.status = 400;
    ctx.response.body = {
      message: "room is not exist",
    };
    return;
  }
  const realRoomId = roomInfo.data.room_id;
  const playurlJson = await fetch(
    `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${realRoomId}&qn=10000&platform=web`,
    {
      headers: {
        Referer: "https://live.bilibili.com/",
        Cookie: COOKIES,
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
      },
    },
  );
  const playurl = await playurlJson.json();
  const url = playurl.data.durl[0].url;
  const stream = await fetch(url, {
    headers: {
      Referer: "https://live.bilibili.com/",
      Cookie: COOKIES,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
    },
  });
  ctx.response.status = 200;
  ctx.response.body = stream.body;
};
