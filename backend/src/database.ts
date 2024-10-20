export interface UserData {
    userName: string,
    hashedPassword: string,
    activeKeys: string,
    isStaff: boolean
}

export default class Database {
    static users: UserData[] = []
    static async saveNewUser(userData: UserData) {
        Database.users.push(userData)
        return userData
    }
    static async getUser(userName: string) {
        const user = Database.users.find(userData => userData.userName === userName)
        return user
    }
}