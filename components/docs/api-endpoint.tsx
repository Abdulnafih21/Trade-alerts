import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "./code-block"

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  response: string
  example: string
}

export function ApiEndpoint({ method, endpoint, description, parameters, response, example }: ApiEndpointProps) {
  const methodColors = {
    GET: "bg-blue-500",
    POST: "bg-green-500",
    PUT: "bg-yellow-500",
    DELETE: "bg-red-500",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Badge className={`${methodColors[method]} text-white`}>{method}</Badge>
          <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint}</code>
        </div>
        <CardTitle className="text-lg font-[var(--font-heading)]">{description}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parameters && parameters.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Parameters</h4>
            <div className="space-y-2">
              {parameters.map((param) => (
                <div key={param.name} className="flex items-start space-x-3 text-sm">
                  <code className="bg-muted px-2 py-1 rounded text-xs">{param.name}</code>
                  <Badge variant="outline" className="text-xs">
                    {param.type}
                  </Badge>
                  {param.required && (
                    <Badge variant="destructive" className="text-xs">
                      required
                    </Badge>
                  )}
                  <span className="text-muted-foreground">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Response</h4>
          <CodeBlock code={response} language="json" />
        </div>

        <div>
          <h4 className="font-semibold mb-2">Example</h4>
          <CodeBlock code={example} language="javascript" />
        </div>
      </CardContent>
    </Card>
  )
}
