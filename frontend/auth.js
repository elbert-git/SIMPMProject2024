/*
Todo:
    - init()
 - login
 - logout
 - read 
    - read rooms
    - read bookings
    - create bookings
- create rooms
    - create bookings
    - create rooms
*/
class Auth {
  static baseUrl = "http://192.53.113.254:3000";
  static localStorageKey = "sim-pm-auth";
  constructor() {
    console.log("auth initialised");
    this.state = {
      authUser: null,
    };
    this.onAuthStateChanged = (() => {
      console.log("Auth state changed to:", this.state.authUser);
    }).bind(this);
  }
  async login(email, password) {
    // make fetch
    const res = await fetch(`${Auth.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    // based on fetch react
    const resJson = await res.json();
    // if pass, save the auth token and update token
    if (resJson.status === "ok") {
      localStorage.setItem(Auth.localStorageKey, resJson.accessToken);
      this.state.this.onAuthStateChanged();
    } else {
      console.error("login failed:", resJson.message);
    }
    return resJson;
  }
}
