import { round } from "https://deno.land/x/math@v1.1.0/mod.ts";
const encoder = new TextEncoder();

interface User {
    id: number,
    userId: number,
    deposits: number,
    username: string,
    availableTime: number
}

interface ActualUser {
    name: string,
    balance: number,
    time: number
}

const headers = new Headers();
headers.append('Authorization', 'Basic ' + btoa('admin:admin'));


const host = Deno.args[0] || `127.0.0.1`

const usersData = await fetch(`http://${host}/api/users`, {headers: headers})
await Deno.writeFile('users.json', encoder.encode(await usersData.text()))

const balanceData = await fetch(`http://${host}/api/users/balance`, {headers: headers})
await Deno.writeFile('balance.json', encoder.encode(await balanceData.text()))

const balanceFileContent: Array<User> = JSON.parse(await Deno.readTextFile('balance.json')).result
const usersFileContent: Array<User> = JSON.parse(await Deno.readTextFile('users.json')).result

const usersArray: Array<ActualUser> = []

balanceFileContent.forEach((user: User) => {
    if (user.deposits < 10) return
    const current: User = usersFileContent.find(o => o.id === user.userId)!;
    usersArray.push({ name: current.username, balance: user.deposits, time: Number(round(user.availableTime, 0)) / 60 })
});

const usersTable: Array<string> = []
usersTable.push(`Пользователь, Баланс, Время в минутах\n`)

usersArray.forEach((user: ActualUser) => {
    usersTable.push(`${user.name}, ${user.balance}, ${user.time}\n`)
    console.log(`Пользователь: ${user.name}. Осталось ${user.balance} рублей и ${user.time} минут`)
})

await Deno.writeFile('users.csv', encoder.encode(usersTable.join('')))

await Deno.remove('users.json')
await Deno.remove('balance.json')

