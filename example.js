/*

(service "http"
  ; `http` is an HTTP server that is reverse proxied by `nginx`.  It listens
  ; on port 8080 and responds with a JSON object containing the name of
  ; the service ("http") and the request's HTTP headers.  This way, tests can
  ; see which trace context, if any, was propagated to the reverse proxied
  ; server.
  (image "nginx-datadog-test-services-http")
  (build
    (context "./services/http")
    (dockerfile "./Dockerfile"))
  (environment
    (DD_ENV "prod")
    (DD_AGENT_HOST "agent")
    (DD_SERVICE "http"))
  (depends_on "agent"))


(* service @string:name
  @"Documentation about service"
  (? image
    @"Something about image"
    @string)
  (? build
    (? context @string @"something about context")
    (? dockerfile @string)
    (? args
      (* (@string @string))))
  (? cap_add (* @string))
  (? depends_on (* @string)))

*/

