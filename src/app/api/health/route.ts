// 死活監視用。Route Handlers(ビジネスロジック API)はこの src/app/api/ 配下に置く
export async function GET() {
  return Response.json({ status: 'ok' })
}
