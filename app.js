// Max Base
// 12 Sep, 2021 - 13 Sep, 2021
// https://github.com/BaseMax/OnSystemChat

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

# SELECT NUMBER OF PERSONAL ROOM WITH OTHER ACCOUNTS YOU HAVE ('1' user)
SELECT
		COUNT(*)
	    AS
	    	count
	FROM
	(
		SELECT
	        #COUNT(room.id) as count
	        room.id
	        #CONCAT(user.firstname, ' ', user.lastname) as name,
	        #(SELECT COUNT(r.id) FROM room_member as r WHERE room = room.id) as members,
	        #(SELECT COUNT(rm.user) FROM room_member as rm WHERE rm.room = room.id AND rm.user = 1) as my_at
	    FROM
	        room
	    INNER JOIN
	        room_member
	        ON
	            room_member.room = room.id
	    INNER JOIN
	        user
	        ON
	            user.id = room_member.user
	    WHERE
	        user.id != 1
	    #	(
	    #        room_member.user = 4
	    #        OR
	    #        room_member.user = 1
	    #    )
	        AND
	        room.isgroup = 0
	    GROUP BY
	        room.id
	    HAVING
	        (SELECT COUNT(rm.user) FROM room_member as rm WHERE rm.room = room.id AND rm.user = 1) = 1
	    #    AND
	    #    (SELECT COUNT(rm.user) FROM room_member as rm WHERE rm.room = room.id AND rm.user != 1) = 2
	        AND
	        (SELECT COUNT(r.id) FROM room_member as r WHERE room = room.id) = 2

	    #(SELECT COUNT(id) FROM `room_member` WHERE user = 4;
	    #SELECT COUNT(id) FROM `room_member` WHERE user = 1;
	)
	as count
	;


# DOES USER `1' has a private room with user '3'? if count is 0 mean no, if that is 1, so yes they have a private room
SELECT
		3
	IN
	(
		SELECT
	    	user.id
	    FROM
	        room
	    INNER JOIN
	        room_member
	        ON
	            room_member.room = room.id
	    INNER JOIN
	        user
	        ON
	            user.id = room_member.user
	    WHERE
	        user.id != 1
	        AND
	        room.isgroup = 0
	    GROUP BY
	        room.id
	    HAVING
	        (SELECT COUNT(rm.user) FROM room_member as rm WHERE rm.room = room.id AND rm.user = 1) = 1
	        AND
	        (SELECT COUNT(r.id) FROM room_member as r WHERE room = room.id) = 2
	)
	as count
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
			// console.log("going to send data", data)
			users[sock].send(JSON.stringify(data))
		})
	}

	const send_to_all = (data) => {
		console.log(`send_to_all: `, room, data)
		// TODO
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
			histories = result
			// console.log(`histories: `, histories)
	
			// Set the user ONLINE
			console.log(`set the user ONLINE: `, socket.info.id)
			if(!users[socket.info.id]) users[socket.info.id] = socket

			// Put the user ONLINE at the groups
			for(const history of histories) {
				console.log(`Create room: `, history)

				// create the room
				console.log(`create room: `, history.room.id)
				if(!rooms[history.room.id]) rooms[history.room.id] = {}
				// join the room
				console.log(`join the room: `, history.room.id, socket.info.id)
				if(!rooms[history.room.id][socket.info.id]) rooms[history.room.id][socket.info.id] = true
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
		} catch(e) {
			console.error(`Selects Database catch: `, e)
		}

		socket.on('message', async (data) => {
			// console.log(`message: `, data)
			const command = JSON.parse(data)
			console.log(`message: `, command)
			const type = command.type

			if(type === 'EDIT_MESSAGE') {
				try {
					let sql = `UPDATE message SET caption = '${command.message.caption}' WHERE id = ${command.message.id};`
					// console.log(`update query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)

					send_to_room(command.room.id, command)
				} catch(e) {
					console.error(`Insert Database catch: `, e)
				}
			}
			else if(type === 'SEND_MESSAGE') {
				try {
					let sql = `INSERT
								INTO message
								(room, user, type, caption, filename, edited)
								VALUES (${command.to.id},
										${command.from.id},
										${command.message.file ? 1 : (command.message.voice ? 2 : 0)},
										${command.message.caption ? "'"+command.message.caption+"'" : '""'},
										${command.message.file ? "'"+command.message.file+"'" : (command.message.voice ? "'"+command.message.voice+"'" : 'NULL')},
										0)
								;`
					// console.log(`insert query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)
					// if(command.to.type === 'GROUP') {
					// 	send_to_room(command.to.id, command)
					// } else {
					// 	// send_to_me(command)
					// 	// send_to_user(command.to.id, command)
					// }
					send_to_room(command.to.id, command)
				} catch(e) {
					console.error(`Insert Database catch: `, e)
				}
			}
			else if(type === 'JOIN_USER') {
				try {
					let sql = `SELECT
										${command.user}
									IN
									(
										SELECT
									    	user.id
									    FROM
									        room
									    INNER JOIN
									        room_member
									        ON
									            room_member.room = room.id
									    INNER JOIN
									        user
									        ON
									            user.id = room_member.user
									    WHERE
									        user.id != ${command.from.id}
									        AND
									        room.isgroup = 0
									    GROUP BY
									        room.id
									    HAVING
									        (SELECT COUNT(rm.user) FROM room_member as rm WHERE rm.room = room.id AND rm.user = ${command.from.id}) = 1
									        AND
									        (SELECT COUNT(r.id) FROM room_member as r WHERE room = room.id) = 2
									)
									as count
									;`
					// console.log(`select query: `, sql)
					let [result] = await query(sql)
					// console.log(`result query: `, result)
					// console.log(`count: `, result.count, result)
					if(result.count === 0) {
						let sql = `INSERT INTO room (server, isgroup) VALUES(1, 0);`
						// console.log(`insert query: `, sql)
						let result = await query(sql)
						// console.log(`result query: `, result)
						// console.log(`result lastID: `, result.insertId)
						let roomID = result.insertId

						sql = `INSERT INTO room_member (room, user) VALUES(${roomID}, ${socket.info.id});`
						// console.log(`insert query: `, sql)
						result = await query(sql)
						// console.log(`result query: `, result)

						sql = `INSERT INTO room_member (room, user) VALUES(${roomID}, ${command.user});`
						// console.log(`insert query: `, sql)
						result = await query(sql)
						// console.log(`result query: `, result)

						sql = `INSERT INTO message (room, user, type, caption) VALUES(${roomID}, ${socket.info.id}, 0, 'سلام.');`
						// console.log(`insert query: `, sql)
						result = await query(sql)
						// console.log(`result query: `, result)

						sql = `SELECT CONCAT(firstname, ' ', lastname) AS name, image FROM user WHERE id = ${command.user};`
						console.log(`select query: `, sql)
						result = await query(sql)
						console.log(`result query: `, result[0])
						let userName = result[0].name

						send_to_me({
							type: 'OPEN_ROOM',
							from: undefined,
							room: {
								id: roomID,
								name: userName,
								type: 'USER',
								image: result[0].image
							}
						})
					}
				} catch(e) {
					console.error(`Select the row from database catch: `, e)
				}
			}
			else if(type === 'JOIN_ROOM') {
			}
			else if(type === 'ASK_SEARCH_GROUPS') {
				try {
					let sql = `SELECT
										room.id, room.name, room.image
									FROM
										room_member
									INNER JOIN
										room
									    ON
									    	room.id = room_member.room
									WHERE
										user != ${socket.info.id}
									    AND
										room.isgroup = 1
									GROUP BY
										room_member.room
									;`
					// console.log(`selects query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)
					send_to_me({
						type: 'ANSWER_SEARCH_GROUPS',
						from: undefined,
						groups: result
					})
				} catch(e) {
					console.error(`Selects Database catch: `, e)
				}
			}
			else if(type === 'ASK_MY_GROUPS') {
				try {
					let sql = `SELECT
								        room.id, room.name, room.image
								    FROM
								        room_member
								    INNER JOIN
								        room
								        ON
								            room.id = room_member.room
								    WHERE
								        room.isgroup = 1
								        AND
								        room_member.user = ${socket.info.id}
								    GROUP BY
								        room_member.room
								    ;`
					// console.log(`selects query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)
					send_to_me({
						type: 'ANSWER_MY_GROUPS',
						from: undefined,
						groups: result
					})
				} catch(e) {
					console.error(`Selects Database catch: `, e)
				}
			}
			else if(type === 'ASK_MESSAGES_OF_ROOM') {
				try {
					let sql = `SELECT
									user.id as user_id,
									CONCAT(user.firstname, " ", user.lastname) AS user_name,
								    message.id AS id,
								    message.type AS type,
								    message.caption AS caption,
								    message.filename AS filename,
								    message.edited AS edited
								FROM
									message
								INNER JOIN
									user
								    ON
								    	user.id = message.user
								WHERE
									message.room = ${command.room.id}
								;`
					// console.log(`selects query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)

					result.forEach((element, index) => {
						result[index].user = {
							id: element.user_id,
							name: element.user_name,
							type: 'USER',
						}
						delete result[index].user_id
						delete result[index].user_name

						// console.log(result[index])
					})

					send_to_me({
						type: 'ANSWER_MESSAGES_OF_ROOM',
						from: undefined,
						room: command.room,
						messages: result
					})
				} catch(e) {
					console.error(`Selects Database catch: `, e)
				}
			}
			else if(type === 'ASK_MEMBERS_OF_GROUP') {
				try {
					let sql = `SELECT
									user.id,
									CONCAT(user.firstname, " ", user.lastname) AS name
									FROM
										room_member
									INNER JOIN
										user
									    ON
									    	user.id = room_member.user
									WHERE
										room = ${command.room.id}
									GROUP BY
										room_member.user	
									ORDER BY
										room_member.id DESC
									;`
					// console.log(`selects query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)

					send_to_me({
						type: 'ANSWER_MEMBERS_OF_GROUP',
						from: undefined,
						room: command.room,
						users: result
					})
				} catch(e) {
					console.error(`Selects Database catch: `, e)
				}
			}
			else if(type === 'ASK_MY_USERS') {
				try {
					let sql = `SELECT
										user.id, CONCAT(user.firstname, " ", user.lastname) as name
									FROM
										room_member
									INNER JOIN
										room
									    ON
									    	room.id = room_member.room
									INNER JOIN
										user
									    ON
									    	user.id = room_member.user
									WHERE
										user = ${socket.info.id}
									    AND
										room.isgroup = 0
									GROUP BY
										user
									;`
					// console.log(`selects query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)

					send_to_me({
						type: 'ANSWER_MY_USERS',
						from: undefined,
						users: result
					})
				} catch(e) {
					console.error(`Selects Database catch: `, e)
				}
			}
			else if(type === 'ASK_SEARCH_USERS') {
				try {
					let sql = `SELECT
										user.id, CONCAT(user.firstname, " ", user.lastname) as name
									FROM
										room_member
									INNER JOIN
										room
									    ON
									    	room.id = room_member.room
									INNER JOIN
										user
									    ON
									    	user.id = room_member.user
									WHERE
										user != ${socket.info.id}
									    AND
										room.isgroup = 0
									GROUP BY
										user
									;`
					// console.log(`selects query: `, sql)
					let result = await query(sql)
					// console.log(`result query: `, result)

					send_to_me({
						type: 'ANSWER_SEARCH_USERS',
						from: undefined,
						users: result
					})
				} catch(e) {
					console.error(`Selects Database catch: `, e)
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

		})
	} catch(e) {
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
