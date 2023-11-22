; What does the schema look like?
; types: @string @number

(define service @string:name
  @"Documentation about \"service\""
  (? image
    @"Something about \"image\""
    @string)
  (? build
    (? context @string)
    (? dockerfile @string)
    (? args
      (* (@string @string))))
  (* port
    (outside (? @string:host @"e.g. 127.0.0.1") @number:port)
    (inside  (? @string:host) @number:port))
  (? environment (* @string (? @string)))
  (? cap_add (* @string))
  (? depends_on (* @string)))

(@define interface @string:name
  (| @port ...)
  (| @socket ...)
  (| @pipes ...)
  (options ...))

; How do we enforce the constraint (or do we) that
; there are no two "service" with the same name?
(service "nginx"
  ; 'nginx' is the service that loads the Datadog module and is sent requests
  ; to probe the module's behavior.
  (image "nginx-datadog-test-services-nginx")
  (build
    (context "./services/nginx")
    (dockerfile "./Dockerfile")
    (args
      (BASE_IMAGE ($ "BASE_IMAGE"))
      (NGINX_CONF_PATH ($ "NGINX_CONF_PATH"))
      (NGINX_MODULES_PATH ($ "NGINX_MODULES_PATH"))))
  (cap_add "SYS_PTRACE")
  (depends_on
    "http"
    "fastcgi"
    "grpc"
    "agent"))

; Canonical mapping to JSON?
; {
;    "service": {
;        "name": "nginx",
;        "image": "nginx-datadog-test-services-nginx",
;        "build": {
;           "context": "./services/nginx",
;           "dockerfile": "./Dockerfile",
;           "args": {
;               ...
;           }
;        },
;        "cap_add": ["SYS_PTRACE"],
;        "depends_on": ["http", "fastcgi", ...]
;    }
; }

(service "agent"
  ; 'agent' is a mock trace agent.  It listens on port 8126, accepts msgpack,
  ; decodes the resulting traces, and prints them to standard output as JSON.
  ; The tests can inspect traces sent to the agent (e.g. from the nginx module)
  ; by looking at 'agent' log lines in the output of 'docker-compose up'.
  (image "nginx-datadog-test-services-agent")
  (build
    (context "./services/agent")
    (dockerfile "./Dockerfile")))

(service "http"
  ; 'http' is an HTTP server that is reverse proxied by 'nginx'.  It listens
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
  (port (outside "127.0.0.1" 8080) (inside 8080))
  (depends_on "agent"))
