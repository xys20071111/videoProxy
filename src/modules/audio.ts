import { COOKIES } from "../constant.ts";
import { Context, Middleware } from "../deps.ts";

export const audio: Middleware = async (ctx: Context) => {
  const query = ctx.request.url.searchParams;
  const videoId = query.get("videoId");
  if (!videoId) {
    ctx.response.status = 400;
    ctx.response.body = {
      message: "videoId is required",
    };
    return;
  }
  const videoInfoJson = await fetch(
    `https://api.bilibili.com/x/web-interface/view?${
      videoId?.startsWith("av") ? "avid=" + videoId : "bvid=" + videoId
    }`,
    {
      headers: {
        Referer: "https://www.bilibili.com/",
        Cookie: COOKIES,
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
      },
    },
  );
  if (videoInfoJson.status !== 200) {
    ctx.response.status = videoInfoJson.status;
    ctx.response.body = {
      message: "fetch video info failed",
    };
    return;
  }
  const videoInfo = await videoInfoJson.json();
  const cid: number = videoInfo.data.cid;
  const videoUrlInfoJson = await fetch(
    `https://api.bilibili.com/x/player/playurl?fnver=0&fnval=16&cid=${cid}&qn=80&${
      videoId?.startsWith("av") ? "avid=" + videoId : "bvid=" + videoId
    }`,
    {
      headers: {
        Referer: "https://www.bilibili.com/",
        Cookie: COOKIES,
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
      },
    },
  );
  const videoUrlInfo = await videoUrlInfoJson.json();
  // const videoUrl = videoUrlInfo.data.durl[0].url
  // const video = await fetch(videoUrl, {
  //     headers: {
  //         Referer: 'https://www.bilibili.com/',
  //         Cookie: COOKIES,
  //         'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0'
  //     }
  // })
  const videoUrl = videoUrlInfo.data.dash.audio[0].baseUrl;
  const video = await fetch(videoUrl, {
    headers: {
      Referer: "https://www.bilibili.com/",
      Cookie: COOKIES,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
    },
  });
  ctx.response.status = 200;
  ctx.response.body = video.body;
};
