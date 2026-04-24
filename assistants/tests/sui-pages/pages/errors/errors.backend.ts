export function ApiGetStatus() {
  return { status: "ok" };
}

export function ApiRequireAuth(data: Record<string, any>, req: any) {
  if (!req || !req.authorized || !req.authorized.user_id) {
    throw new Error("unauthorized");
  }
  return { user_id: req.authorized.user_id };
}

export function GetRenderData(params: Record<string, any>, req: any) {
  return { rendered: true, params: params };
}
