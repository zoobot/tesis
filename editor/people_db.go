package main

import (
  "encoding/json"
  "fmt"
  "gopkg.in/mgo.v2"
  "gopkg.in/mgo.v2/bson"
  "net/http"
)

type People struct {
  Id          bson.ObjectId `json:"id" bson:"id,omitempty"`
  UserName    string        `json:"username" bson:"username"`
  Email       string        `json:"email" bson:"email"`
  Password    string        `json:"password" bson:"password"`
  Avatar      string        `json:"avatar" bson:"avatar"`
  MemberSince int64         `json:"membersince" bson:"membersince"`
}

// CreateUser creates a new user resource
func CreateUser(w http.ResponseWriter, r *http.Request) {
  session, err := mgo.Dial("mongodb://localhost:27017")
  if err != nil {
    w.WriteHeader(404)
    return
  }
  defer session.Close()
  session.SetMode(mgo.Monotonic, true)
  c := session.DB("tesis").C("people")

  var u People
  u.Id = bson.NewObjectId()
  err = json.NewDecoder(r.Body).Decode(&u)
  if err != nil {
    w.WriteHeader(404)
    return
  }

  secret := "farfegnugen"

  u.Password = bcryptit(secret + u.Password)

  index := mgo.Index{
    Key:        []string{"username"},
    Unique:     true,
    DropDups:   true,
    Background: true,
    Sparse:     true,
  }
  err = c.EnsureIndex(index)
  if err != nil {
    return
  }
  err = c.Insert(u)
  if err != nil {
    w.WriteHeader(404)
  } else {
    w.WriteHeader(201)
  }
  uj, _ := json.Marshal(u)
  w.Header().Set("Content-Type", "application/json")
  fmt.Fprintf(w, "%s", uj)
}

// AuthUser checks if user resource exists and if user is legit
func AuthUser(w http.ResponseWriter, r *http.Request) {
  session, err := mgo.Dial("mongodb://localhost:27017")
  if err != nil {
    w.WriteHeader(404)
    return
  }
  defer session.Close()
  session.SetMode(mgo.Monotonic, true)
  c := session.DB("tesis").C("people")

  u := People{}

  secret := "farfegnugen"

  err = json.NewDecoder(r.Body).Decode(&u)
  if err != nil {
    w.WriteHeader(404)
    return
  }

  pt := secret + u.Password

  err = c.Find(bson.M{"username": u.UserName}).One(&u)
  if err != nil {
    w.WriteHeader(404)
    return
  } else {
    validate := decryptit(u.Password, pt)

    fmt.Println("peopledb auth", validate)
    if validate == "Valid" {
      fmt.Println("peopledb if username Valid 200", u.UserName, u)
      // uj, _ := json.Marshal(u)
      // fmt.Fprintf(w, "%s", uj)
      // w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(200)

      // w.Header().Set("Content-Type", "application/json")
    } else {
      fmt.Println("peopledb if Valid 200", w, "%s")
      w.WriteHeader(404)
      return
    }
  }

  uj, _ := json.Marshal(u)
  fmt.Fprintf(w, "%s", uj)
  w.Header().Set("Content-Type", "application/json")
}

// GetUser gets a user resource
func GetUser(w http.ResponseWriter, r *http.Request) {
  session, err := mgo.Dial("mongodb://localhost:27017")
  if err != nil {
    w.WriteHeader(404)
    return
  }
  defer session.Close()
  c := session.DB("tesis").C("people")
  var results []People
  err = r.ParseForm()
  if err != nil {
    return
  }
  if _, ok := r.Form["id"]; ok {
    // ?id=1234567ythgfd!
    err = c.Find(bson.M{"id": bson.ObjectIdHex(r.Form.Get("id"))}).All(&results)
    if err != nil {
      w.WriteHeader(404)
      return
    }
    uj, _ := json.Marshal(results)
    w.WriteHeader(200)
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintf(w, "%s", uj)
    return
  } else if _, ok := r.Form["username"]; ok {
    // Params -->  ?username=Sally123!
    err = c.Find(bson.M{"username": r.Form.Get("username")}).All(&results)
    if err != nil {
      w.WriteHeader(404)
      return
    }
    uj, _ := json.Marshal(results)
    w.WriteHeader(200)
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintf(w, "%s", uj)
    return
  } else {
    // No params
    err = c.Find(bson.M{}).Sort("-timestamp").All(&results)
    if err != nil {
      w.WriteHeader(404)
      return
    }
    uj, _ := json.Marshal(results)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(200)
    fmt.Fprintf(w, "%s", uj)
    return
  }
}

// UpdateUser updates users personal information
func UpdateUser(w http.ResponseWriter, r *http.Request) {
  session, err := mgo.Dial("mongodb://localhost:27017")
  if err != nil {
    w.WriteHeader(404)
    return
  }
  defer session.Close()
  session.SetMode(mgo.Monotonic, true)
  c := session.DB("tesis").C("people")
  var d People
  err = json.NewDecoder(r.Body).Decode(&d)
  if err != nil {
    w.WriteHeader(404)
    return
  }
  err = c.Update(bson.M{"id": d.Id}, bson.M{"id": d.Id, "username": d.UserName, "email": d.Email, "password": d.Password, "avatar": d.Avatar})
  if err != nil {
    w.WriteHeader(404)
    return
  }
  uj, _ := json.Marshal(d)
  w.WriteHeader(200)
  w.Header().Set("Content-Type", "application/json")
  fmt.Fprintf(w, "%s", uj)
}

// DeleteUser deletes entire user resource
func DeleteUser(w http.ResponseWriter, r *http.Request) {
  session, err := mgo.Dial("mongodb://localhost:27017")
  if err != nil {
    w.WriteHeader(404)
    return
  }
  defer session.Close()
  session.SetMode(mgo.Monotonic, true)
  c := session.DB("tesis").C("people")
  var d People
  if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
    w.WriteHeader(404)
    return
  }
  err = c.Remove(bson.M{"id": d.Id})
  if err != nil {
    w.WriteHeader(404)
    return
  }
  w.WriteHeader(200)
  w.Header().Set("Content-Type", "application/json")
  fmt.Fprintf(w, "%s", "User removed Successfully!")
}
