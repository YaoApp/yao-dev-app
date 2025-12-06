// @ts-nocheck

/**
 * Next Hook for Vision Helper Assistant
 * Returns the LLM response with file metadata validation info for testing
 */
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  const completion = payload.completion;

  // Extract file metadata from Space for validation
  let fileMetadata = null;
  if (ctx && ctx.space && ctx.assistant_id) {
    try {
      // Get all files info (array) using assistant ID as namespace
      const filesKey = ctx.assistant_id + ":files_info";
      const filesInfo = ctx.space.Get(filesKey);

      // Get current file info (single object) using assistant ID as namespace
      const currentKey = ctx.assistant_id + ":current_file";
      const currentFile = ctx.space.Get(currentKey);

      fileMetadata = {
        assistant_id: ctx.assistant_id,
        has_files_info: filesInfo && Array.isArray(filesInfo),
        files_count:
          filesInfo && Array.isArray(filesInfo) ? filesInfo.length : 0,
        has_current_file: !!currentFile,
        files_info: filesInfo || null,
        current_file: currentFile || null,
      };

      console.log("=== Vision Helper File Metadata ===");
      console.log(JSON.stringify(fileMetadata, null, 2));
      console.log("===================================");
    } catch (e) {
      console.log("=== Error reading File Info from Space ===");
      console.log(e);
    }
  }

  // Return the completion content as-is
  if (!completion || !completion.content) {
    return {
      data: "Unable to analyze the image.",
      metadata: fileMetadata,
    };
  }

  const content =
    typeof completion.content === "string"
      ? completion.content
      : JSON.stringify(completion.content);

  // Return both content and file metadata for testing validation
  return {
    data: content,
    metadata: fileMetadata,
  };
}
