(thing 
  ; here's a comment
  "strings can
contain line breaks"
  (child ["foo", 2, "bar"]))

(different-thing)

(service
  (name "foo")
  (image "thingy/alpine")
  (port (outside "127.0.0.1" 8080) (inside 80)))

 (service "foo"
  (image "thingy/alpine")
  (port (outside "127.0.0.1" 8080) (inside 80))) 
