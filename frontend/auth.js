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
    // static baseUrl = "http://192.53.113.254:3000";
    static baseUrl = "http://localhost:3000";
    static localStorageKey = "sim-pm-auth";
    constructor() {
        // initialise aith
        console.log("auth initialised");
        this.state = {
            credentials: null,
            accessToken: null
        };
        this.onAuthStateChanged = (() => {
            console.log("Auth state changed to:", this.state.authUser);
        }).bind(this);

        // check if theres is an existing auth
        let load = null
        try {
            load = JSON.parse(localStorage.getItem(Auth.localStorageKey))
        } catch (error) {
            console.log(error)
        }

        // continue initialisation based on load result
        if (load) {
            console.log("existing auth data loaded")
            // save state
            this.state.credentials = load.credentials
            this.state.accessToken = load.accessToken
        } else {
            console.log("no existing auth data found")
        }
    }
    async login(email, password) {
        // make fetch
        const res = await fetch(`${Auth.baseUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });
        // based on fetch react
        const resJson = await res.json();
        // if pass, save the auth token and update token
        if (resJson.status === "ok") {
            // save access token and credentials
            localStorage.setItem(Auth.localStorageKey,
                JSON.stringify({
                    accessToken: resJson.accessToken,
                    credentials: resJson.credentials
                })
            );
            // update state
            this.state.credentials = resJson.credentials
            // invoke callback
            this.onAuthStateChanged(resJson.credentials);
        } else {
            console.error("login failed:", resJson.message);
        }
        return resJson;
    }
    async register(email, userName, password, isStaff = false) {
        console.log(isStaff)
        // make fetch
        const res = await fetch(`${Auth.baseUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                userName: userName,
                password: password,
                isStaff: isStaff
            }),
        });
        // process response
        const resJson = await res.json()
        // return
        return resJson
    }
    async logout() {
        // delete state
        this.state = {}
        // delete local storage
        localStorage.setItem(Auth.localStorageKey, "")
        // invoke call back 
        this.onAuthStateChanged(null)
    }
    async getAllRooms() {
        const res = await fetch(`${Auth.baseUrl}/getAllRooms`, {
            headers: { Authorization: `Bearer ${this.state.accessToken}` }
        })
        return await res.json()
    }
    async createRoom(body) {
        try {
            const res = await fetch(`${Auth.baseUrl}/createRoom`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.state.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            const resJson = await res.json()
            console.log(resJson)
            return resJson
        } catch (error) {
            console.log(error)
        }
    }
    async updateRoom(id, body) {
        console.log(body)
        try {
            const res = await fetch(`${Auth.baseUrl}/updateRoom`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.state.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    roomId: id,
                    changes: body
                })
            })
            const resJson = await res.json()
            console.log(resJson)
            return resJson
        } catch (error) {
            console.log(error)
        }
    }
}
