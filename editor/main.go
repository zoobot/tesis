package main

import (
  "fmt"
  "github.com/gorilla/mux"
  "log"
  "net/http"
  "net/http/httputil"
  "net/url"
)

const (
  PORTSSL    = ":8443"
  PORTREG    = ":8000"
  PUBLIC_KEY = "./cert.pem"
  PRIV_KEY   = "./key.pem"
)

// func redirectToHttps(w http.ResponseWriter, r *http.Request) {
//   // Redirect to https localhost:8443 will only work locally
//   http.Redirect(w,r, "https://localhost:"+PORTSSL+r.RequestURI, http.StatusMovedPermanently)
//

// func hander(w http.ResponseWriter, r *http.Request) {
//   fmt.Fprintf(w, "Hi there mover and shaker!")
// }

// handles routing
func main() {
  fmt.Println("Go server, go! (8k)")
  // run the hub to start websockets
  go h.run()

  // gorilla router
  r := mux.NewRouter()

  // websocket endpoint
  r.HandleFunc("/ws/{channel}", serveWS)

  // Because we're using http we can't connect directly to the node server.
  // The below sets up reverse proxies to allow http access to node.
  // u, _ := url.Parse("https://98e168f1.ngrok.io")
  // ngrok change
  u, _ := url.Parse("http://localhost:3000")
  r.Handle("/sentiment", httputil.NewSingleHostReverseProxy(u))
  r.Handle("/stats", httputil.NewSingleHostReverseProxy(u))

  /* ======>API<====== */
  // People table
  r.HandleFunc("/db/user/signup", CreateUser).Methods("POST")
  r.HandleFunc("/db/user/signin", AuthUser).Methods("POST")
  r.HandleFunc("/db/user", GetUser).Methods("GET")
  r.HandleFunc("/db/user", UpdateUser).Methods("PUT")
  r.HandleFunc("/db/user", DeleteUser).Methods("DELETE")
  // Documents table
  r.HandleFunc("/db/docs", AddDoc).Methods("POST")
  r.HandleFunc("/db/docs", GetDoc).Methods("GET")
  r.HandleFunc("/db/docs", UpdateDoc).Methods("PUT")
  r.HandleFunc("/db/docs", DeleteDoc).Methods("DELETE")
  // Sessions table
  r.HandleFunc("/db/sessions/createsession", CreateSession).Methods("POST")
  r.HandleFunc("/db/sessions", GetSessions).Methods("GET")
  /* <======end API======> */

  // Serve static files (make sure index has /client at start, so paths match)
  s := http.StripPrefix("/client", http.FileServer(http.Dir("client")))
  r.PathPrefix("/client").Handler(s)

  // serve index.html to root, or any path we don't recognise.
  r.HandleFunc("/", serveIndex)
  r.NotFoundHandler = http.HandlerFunc(serveIndex)

  // start 'er up.
  log.Fatal(http.ListenAndServeTLS(PORTSSL, PUBLIC_KEY, PRIV_KEY, r))
  // log.Fatal(http.ListenAndServe(PORTREG, r))
}
func serveIndex(w http.ResponseWriter, r *http.Request) {
  http.ServeFile(w, r, "client/index.html")
}
