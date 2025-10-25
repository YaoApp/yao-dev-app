/**
 * Image Generator
 */

import { Exception, FS, Process, time } from "@yao/runtime";
import { UniqueID } from "./utils";
import { Volcengine } from "./volcengine";

export class Image {
  private model: string;

  constructor(model: string) {
    this.model = model;
  }

  /**
   * Generate an image
   * @param option
   */
  public Generate(prompt: string, option?: Option): string {
    const model = option?.model || this.model || "volcengine-2.1";
    if (model === "volcengine-2.1") {
      return this.volcengine(prompt, option);
    } else if (model === "dall-e-3") {
      return this.dallE(prompt, option);
    }
  }

  private volcengine(prompt: string, option: Option): string {
    const id = Process("utils.env.Get", "VOLCENGINE_ACCESS_KEY_ID");
    const secret = Process("utils.env.Get", "VOLCENGINE_SECRET_ACCESS_KEY");
    const volcengine = new Volcengine({
      AccessKeyId: id,
      SecretAccessKey: secret,
      Service: "cv",
      Region: "cn-north-1",
      Endpoint: "visual.volcengineapi.com",
    });

    const size = option.size || "256";
    const ratio = option.ratio || "1:1";
    let width = parseInt(size);
    let height = parseInt(size);

    const [vw, vh] = ratio.split(":").map(Number);
    if (vw > vh) {
      const times = vw;
      width = parseInt(`${width * vw} / ${vh}`) / times;
      height = parseInt(`${height * vh} / ${vw}`) / times;
    } else {
      const times = vh;
      width = parseInt(`${width * vh} / ${vw}`) / times;
      height = parseInt(`${height * vw} / ${vh}`) / times;
    }

    const resp = volcengine.Post(
      { Action: "CVProcess", Version: "2022-08-31" },
      { req_key: "high_aes_general_v21_L", prompt: prompt, width, height }
    );

    const binary_data_base64 = resp.data.binary_data_base64 || [];
    if (binary_data_base64.length === 0) {
      throw new Exception("No image data", 400);
    }
    const first = binary_data_base64[0];
    const fs = new FS("data");
    const path = `/ai/images/${UniqueID()}.png`;
    fs.WriteFileBase64(path, first);
    return path;
  }

  private dallE(prompt: string, option: Option): string {
    const model = option.model || "dall-e-3";
    return "";
  }

  /**
   * Edit an image
   * @param option
   */
  public Edit(option: Option) {}
}

type Model = "dall-e-2" | "dall-e-3" | "volcengine-2.1";

interface Progress {
  (progress: number): void;
}

interface Option {
  size?: "1024" | "512" | "256";
  ratio?: "1:1" | "4:3" | "3:4" | "3:2" | "2:3" | "16:9" | "9:16";
  model?: Model;
  progress?: Progress;
}
