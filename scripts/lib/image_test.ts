import { Image } from "./image";

/**
 * @test yao run scripts.lib.image_test.TestImageGenerate
 */
function TestImageGenerate() {
  const image = new Image("volcengine-2.1");
  const path = image.Generate("A beautiful girl", {
    size: "1024",
    ratio: "16:9",
  });
  return path;
}
