const fs = require('fs')
const url = require('url')
const http = require('http')
const ws = require('ws')
const express = require('express')
const querystring = require('querystring')
const mysql = require('mysql')
const util = require('util')

// Database queries
/*
# AUTH CONNECT
SELECT user.*
		FROM auth
		INNER JOIN user ON auth.user = user.id
		WHERE session = '...' AND secret = '...' AND status = 1
		;

# PV CHAT LIST OF `user2`
SELECT
	MAX(message.id) as message_id,
	(case when (roomtype = 1) THEN 'GROUP' ELSE 'USER' END) as to_type,
	user2.firstname as to_firstname,
	user2.lastname as to_lastname,
	user as from_id,
	(case when (message.type = 0) THEN 'MESSAGE' ELSE 'FILE' END) as message_type,
	caption,
	user.firstname as from_firstname,
	user.lastname as from_lastname
	FROM
		message
	INNER JOIN
		user
		ON
			user.id = message.user
	INNER JOIN
		user as user2
		ON
			user2.id = message.room
	WHERE
	roomtype=2
		AND (room = ${socket.info.id} OR user = ${socket.info.id})
	GROUP BY user
	ORDER BY message_id DESC
	;

# GROUP CHAT LIST OF `user2`
SELECT
		message.id as message_id,
		(case when (message.roomtype = 1) THEN 'GROUP' ELSE 'USER' END) as to_type,
		room.name as to_firstname, '' as to_lastname,
		message.user as from_id,
		(case when (message.type = 0) THEN 'MESSAGE' ELSE 'FILE' END) as message_type,
		message.caption,
		user.firstname as from_firstname,
		user.lastname as from_lastname
	FROM
		message
	INNER JOIN
		room_member
		ON
			message.room = room_member.room
	INNER JOIN
		user
		ON
			user.id = message.user
	INNER JOIN
		room
		ON
			room.id = message.room
	WHERE
		room_member.user = ${socket.info.id}
		AND
		message.roomtype = 1
	ORDER BY message_id DESC
	;

# ALL CHAT LIST OF `user2`
(
	SELECT
		MAX(message.id) as message_id,
		(case when (roomtype = 1) THEN 'GROUP' ELSE 'USER' END) as to_type,
		user2.firstname as to_firstname,
		user2.lastname as to_lastname,
		user as from_id,
		(case when (message.type = 0) THEN 'MESSAGE' ELSE 'FILE' END) as message_type,
		caption,
		user.firstname as from_firstname,
		user.lastname as from_lastname
		FROM
			message
		INNER JOIN
			user
			ON
				user.id = message.user
		INNER JOIN
			user as user2
			ON
				user2.id = message.room
		WHERE
		roomtype=2
			AND (room = ${socket.info.id} OR user = ${socket.info.id})
		GROUP BY user
	)
	UNION
	(
		SELECT
			message.id as message_id,
			(case when (message.roomtype = 1) THEN 'GROUP' ELSE 'USER' END) as to_type,
			room.name as to_firstname, '' as to_lastname,
			message.user as from_id,
			(case when (message.type = 0) THEN 'MESSAGE' ELSE 'FILE' END) as message_type,
			message.caption,
			user.firstname as from_firstname,
			user.lastname as from_lastname
		FROM
			message
		INNER JOIN
			room_member
			ON
				message.room = room_member.room
		INNER JOIN
			user
			ON
				user.id = message.user
		INNER JOIN
			room
			ON
				room.id = message.room
		WHERE
			room_member.user = ${socket.info.id}
			AND
			message.roomtype = 1
	)
	ORDER BY message_id DESC
	;


SELECT
	    message.id as message_id,
	    message.caption as message_caption,
	    message.type as message_type,
	    message.filename as message_filename,
	    (SELECT CONCAT(user.firstname, " ", user.lastname) as name FROM user as a WHERE id = message.user) as message_sender,
	    room.id as room_id,
	    (CASE WHEN room.name IS NULL THEN 'USER' ELSE 'GROUP' END) as room_type,
	    IFNULL(room.name, (SELECT CONCAT(u.firstname, " ", u.lastname) AS u FROM room_member as r INNER
	           JOIN user as u ON r.user = u.id WHERE r.room = room.id AND u.id != 1
		)) as room_name
	FROM
		room_member
	INNER JOIN
		room
		ON
			room_member.room = room.id
	INNER JOIN
		message
		ON
			message.room = room.id
	INNER JOIN
		user
		ON
			user.id = message.user
	WHERE
		room_member.user = 1
	#    AND
	#    room.id = 3
	GROUP BY
		room.id
	ORDER BY
		message_id DESC
	;

*/

// INIT Server
const app = express()
const server = http.createServer(app)
const port = 5000
const wss = new ws.Server({server:server})

// Database Connect
const conn = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "****",
	database: "onsystem"
})
const query = util.promisify(conn.query).bind(conn)

// Variables
const rooms = {}
const users = {}
let RAND_MESSAGES = 0

// Functions
// const DBRoomsOfUser = (userID) => {
// 	if(userID === 1) 
// 		return [
// 			{id:1, name: 'Group 1', type: 'GROUP'},
// 			{id:2, name: 'Group 2', type: 'GROUP'},
// 			{id:2, name: 'User 2', type: 'USER'},
// 			{id:3, name: 'User 3', type: 'USER'}
// 		]
// 	else if(userID === 2) 
// 		return [
// 			{id:1, name: 'Group 1', type: 'GROUP'},
// 			{id:2, name: 'Group 2', type: 'GROUP'},
// 			{id:2, name: 'User 1', type: 'USER'},
// 			{id:3, name: 'User 3', type: 'USER'}
// 		]
// 	else
// 		return [
// 			{id:1, name: 'Group 1', type: 'GROUP'},
// 			{id:1, name: 'User 1', type: 'USER'},
// 			{id:2, name: 'User 2', type: 'USER'}
// 		]
// }

// Sockets
wss.on('connection', async (socket, request) => {
	const params = url.parse(request.url)
	const qs = querystring.parse(params.query)

	// Socket functions
	const send_to_me = (data) => {
		console.log(`send_to_me: `, socket.info.id, data)
		socket.send(JSON.stringify(data))
	}

	const send_to_user = (user, data) => {
		console.log(`send_to_user: `, user, data)
		// console.log(`users: `, users)
		if(!users[user]) return
		users[user].send(JSON.stringify(data))
	}

	const send_to_room = (room, data) => {
		console.log(`send_to_room: `, room, data)
		// console.log(`rooms: `, rooms)
		if(rooms === {} || rooms === undefined || rooms === null) return
		if(!rooms[room]) return
		Object.entries(rooms[room]).forEach(([sock, ]) => {
			// console.log("sock: ", sock)
			// console.log("users: ", users)
			// console.log("rooms: ", rooms)
			if(!users[sock]) return
			users[sock].send(JSON.stringify(data))
		})
	}

	// Database Auth
	try {
		let sql = `SELECT user.*
						FROM auth
						INNER JOIN user ON auth.user = user.id
						WHERE session = '${qs.session}' AND secret = '${qs.secret}' AND status = 1
						;`
		// console.log(`select query: `, sql)
		let [result] = await query(sql)
		// console.log(`result query: `, result)
		if(result === undefined) {
			console.error(`Access denied!`)
			return
		}

		// Socket Parameters
		socket.info = {
			type: 'USER',
			id: result.id,
			firstname: result.firstname,
			lastname: result.lastname,
		}
		socket.auth = {
			session: qs.session,
			secret: qs.secret,
		}

		console.log(`id: `, socket.info.id)

		// Get history list of the user
		let histories = []
		try {
			let sql = `SELECT
						    message.id as message_id,
						    message.caption as message_caption,
						    (case when (message.type = 0) THEN 'MESSAGE' ELSE 'FILE' END) as message_type,
						    message.filename as message_filename,
						    (SELECT CONCAT(user.firstname, " ", user.lastname) as name FROM user as a WHERE id = message.user) as message_sender,
						    room.id as room_id,
						    (CASE WHEN room.name IS NULL THEN 'USER' ELSE 'GROUP' END) as room_type,
						    IFNULL(room.name, (SELECT CONCAT(u.firstname, " ", u.lastname) AS u FROM room_member as r INNER
						           JOIN user as u ON r.user = u.id WHERE r.room = room.id AND u.id != ${socket.info.id}
							)) as room_name
						FROM
							room_member
						INNER JOIN
							room
							ON
								room_member.room = room.id
						INNER JOIN
							message
							ON
								message.room = room.id
						INNER JOIN
							user
							ON
								user.id = message.user
						WHERE
							room_member.user = ${socket.info.id}
						#    AND
						#    room.id = 3
						GROUP BY
							room.id
						ORDER BY
							message_id DESC
						;`
			// console.log(`selects query: `, sql)
			let result = await query(sql)
			// console.log("result: ", result)
			result.forEach((element, index) => {
				result[index].message = {
					id: element.message_id,
					name: element.message_sender,
					type: element.message_type,
					caption: element.message_caption,
					filename: element.message_filename,
					datetime: 15000
				}
				delete result[index].message_id
				delete result[index].message_sender
				delete result[index].message_type
				delete result[index].message_caption
				delete result[index].message_filename

				result[index].room = {
					id: element.room_id,
					type: element.room_type,
					name: element.room_name
				}
				delete result[index].room_id
				delete result[index].room_type
				delete result[index].room_name

				// console.log(result[index])
			})
			// console.log(`result query: `, result)
			if(result !== undefined) {
				histories = result
			}
			else {
				console.error(`It's not possible to selscts from DB!`)
			}
		} catch(e) {
			console.error(`Selects Database catch: `, e)
		}

		// Set the user ONLINE
		if(!users[socket.info.id]) users[socket.info.id] = socket
		// Put the user ONLINE at the groups
		for(const room of histories) {
			if(room.type === "GROUP") {
				// create the room
				if(!rooms[room.id]) rooms[room.id] = {}
				// join the room
				if(!rooms[room.id][socket.info.id]) rooms[room.id][socket.info.id] = true
			}
		}
		// Say welcome to the user
		send_to_me({
			type: 'WELCOME',
			valid: true,
			from: undefined,
			info: socket.info,
			rooms: histories
		})

		// send_to_me({
		// 	type: 'join',
		// 	from: undefined,
		// 	user: socket.username
		// })

		socket.on('message', async (data) => {
			// console.log(`message: `, data)
			const command = JSON.parse(data)
			console.log(`message: `, command)
			const type = command.type

			if(type === 'SEND_MESSAGE') {
				command.id = ++RAND_MESSAGES
				// Database Auth
				try {
					let sql = `INSERT
								INTO message
								(room, roomtype, user, type, caption, filename, edited)
								VALUES (${command.to.id},
										${command.to.type === "GROUP" ? 1 : 2},
										${command.from.id},
										${command.file ? 1 : (command.voice ? 2 : 0)},
										${command.caption ? "'"+command.caption+"'" : 'NULL'},
										${command.file ? "'"+command.file+"'" : (command.voice ? "'"+command.voice+"'" : 'NULL')},
										0)
								;`
					// console.log(`insert query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)
					if(result !== undefined) {
						if(command.to.type === 'GROUP') {
							send_to_room(command.to.id, command)
						} else {
							send_to_me(command)
							send_to_user(command.to.id, command)
						}
					}
					else {
						console.error(`It's not possible to insert a new message to DB!`)
					}
				} catch(e) {
					console.error(`Insert Database catch: `, e)
				}
			}
		})

		socket.on('error', (e) => {
			console.log(`websocket error: `, e)
		})

		socket.on('close', (e) => {
			console.log(`websocket close: `, e)
			if(!users[socket.info.id]) return
			delete users[socket.info.id]
		})	} catch(e) {
		console.error(`Select Database catch: `, e)
	}
})

// Routes
app.get('/room', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/hi', (req, res) => {
  res.send('<h1>Hello world</h1>')
})

app.use(express.static('public'))

// Server
async function run() {
	let [DBVersion] = await query(`select version()`)
	console.log(`MySQL Version: `, DBVersion)
	server.listen(port, () => {
		console.log(`Web server start. http://localhost:${port}`)
	})
}
run()
