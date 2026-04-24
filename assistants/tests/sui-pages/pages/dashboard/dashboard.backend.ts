export function ApiGetDashboard(status: string) {
  return { title: "Test Dashboard", status: status || "active", items: [1, 2, 3] };
}

export function ApiCreateItem(payload: Record<string, any>) {
  if (!payload || !payload.name) {
    throw new Error("name is required");
  }
  return { id: 1, name: payload.name, created: true };
}

export function GetPageData(params: Record<string, any>, req: any) {
  return { title: "Dashboard", page: params?.page || 1, total: 100 };
}
