//let mrutil = require('./mrtek_modules/mrutil.js')


exports.commandProcessor = function(socket, data) {
	let result = {}
	eventLog('Command:', data.command.brightBlue)
	switch (data.command.toUpperCase()) {
		case 'TIME':
			result = { success: true, data: (new Date()).yyyymmddhhmmss() }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			break
		case 'WHOAREYOU':
			if(connectinfo.id == '') {
				mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, 'NEW_ID', { success: true }, data.requestid))
			} else {
				result = { success: true, data: connectinfo }
				mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			}
			break
		case 'UPDATE':
			command_UPDATE(socket, data)
			break
		case 'NEW_ID':
			result = { success: true, data: connectinfo }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			break
		case 'NEW_PASS':
			result = { success: true, data: connectinfo }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			break
		case 'MSSQL_CONNECTION_TEST':
			command_MSSQL_CONNECTION_TEST(socket, data)
			break
		case 'MSSQL_QUERY':
			command_MSSQL_QUERY(socket, data)
			break
		case 'MYSQL_CONNECTION_TEST':
			command_MYSQL_CONNECTION_TEST(socket, data)
			break
		case 'MYSQL_QUERY':
			command_MYSQL_QUERY(socket, data)
			break
		case 'CMD':
			command_CMD(socket, data)
			break
		case 'JS':
		case 'WSCRIPT':
		case 'CSCRIPT':
		case 'BAT':
		case 'BASH':

			command_JS(socket, data)
			break
		default:
			result = { success: false, error: { code: 'UNKNOWN_COMMAND', message: 'Unknown command.' } }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			break
	}
}

var mssql = require('mssql')

function command_MSSQL_CONNECTION_TEST(socket, data) {

	let config = {
		user: data.params.connection.user || data.params.connection.username || '',
		password: data.params.connection.password,
		server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
		database: data.params.connection.database,
		port: Number(data.params.connection.port || 1433),
		options: {
			encrypt: false, // Use this if you're on Windows Azure
		}
	}

	mssql.connect(config).then(function() {

		let request = new mssql.Request()
		request.query('SELECT GETDATE() as T').then(function(recordset) {
			mssql.close()


			let result = { success: true, data: 'OK' }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))

		}).catch(function(err) {
			mssql.close()
			let result = { success: false, error: { code: err.code || err.name || 'SQLERROR', message: err.name || err.message || 'Sql error' } }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
		})

	}).catch(function(err) {
		errorLog(`SQLSERVER_CONNECTION_ERROR:`, err)
		console.log(config)
		mssql.close()
		let result = { success: false, error: { code: 'SQLSERVER_CONNECTION_ERROR', message: err.message || 'SqlServer connection error' } }
		mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
	})

}


function command_MSSQL_QUERY(socket, data) {
	let config = {
		user: data.params.connection.user || data.params.connection.username || '',
		password: data.params.connection.password,
		server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
		database: data.params.connection.database,
		port: Number(data.params.connection.port || 1433),
		options: {
			encrypt: false, // Use this if you're on Windows Azure
		}
	}
	mssql.close()

	mssql.connect(config).then(function() {
		saveLastQuery((data.params.query || ''))
		let request = new mssql.Request()
		request.query(data.params.query).then(function(recordset) {
			mssql.close()

			let returnData = { rows: [], rowsAffected: 0, output: {} }

			if(recordset.recordsets != undefined) {
				returnData.rows = recordset.recordsets
			}
			if(recordset.rowsAffected != undefined) {
				returnData.rowsAffected = recordset.rowsAffected
			}
			if(recordset.output != undefined) {
				returnData.output = recordset.output
			}

			let result = { success: true, data: returnData }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))

		}).catch(function(err) {
			mssql.close()
			let result = { success: false, error: { code: err.code || err.name || 'SQLERROR', message: err.name || err.message || 'Sql error' } }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))

		})
	}).catch(function(err) {
		errorLog(`SQLSERVER_CONNECTION_ERROR:`, err)
		console.log(config)
		mssql.close()
		let result = { success: false, error: { code: 'SQLSERVER_CONNECTION_ERROR', message: err.message || 'SqlServer connection error' } }
		mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
	})

}


let mysql = require('mysql')

function command_MYSQL_QUERY(socket, data) {


	let config = {
		user: data.params.connection.user || data.params.connection.username || '',
		password: data.params.connection.password,
		server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
		database: data.params.connection.database,
		port: data.params.connection.port || 3306,
		multipleStatements: true,
		options: {
			encrypt: true // Use this if you're on Windows Azure 
		},

	}

	let connection = mysql.createConnection(config)

	connection.connect(function(err) {
		if(!err) {
			connection.query(data.params.query, function(err, rows, fields) {
				if(!err) {
					let rowsAffected = []
					let insertId = []
					let fieldList = []
					let isMultipleQuery = false

					if(fields) {
						if(Array.isArray(fields)) {
							fields.forEach((field, index) => {
								if(field == null) {
									fieldList.push([])
									if(index > 0)
										isMultipleQuery = true
								} else {
									if(Array.isArray(field)) {
										isMultipleQuery = true
										let f = []
										field.forEach((e) => f.push(e.name))

										fieldList.push(f)
									} else {
										if(fieldList.length == 0) {
											fieldList.push([field.name])
										} else {
											fieldList[fieldList.length - 1].push(field.name)
										}

									}

								}
							})
						}
					}

					if(!Array.isArray(rows)) {
						rowsAffected.push(rows.affectedRows || 0)
						insertId.push(rows.insertId || 0)
						rows = [
							[]
						]
						fields = [
							[]
						]
					} else {
						if(!isMultipleQuery) {
							rowsAffected.push(rows.length)
							insertId.push(0)
							rows = new Array(rows)
						} else {
							rows.forEach((row) => {
								if(!Array.isArray(row)) {
									if(isMultipleQuery) {
										rowsAffected.push(row.affectedRows || 0)
										insertId.push(row.insertId || 0)
										row = []
									}
								} else {
									rowsAffected.push(row.length)
									insertId.push(0)

								}
							})
						}
					}



					let result = { success: true, data: { fields: fieldList, rowsAffected: rowsAffected, insertId: insertId, rows: rows } }
					mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
				} else {
					let result = { success: false, error: { code: err.code, message: 'SQL ERROR : ' + err.message } }
					mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
				}
			})
		} else {
			let result = { success: false, error: { code: 'MSQL_CONNECTION_ERROR', message: err.message } }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
		}
	})

}



function command_MYSQL_CONNECTION_TEST(socket, data) {

	console.log('command_MYSQL_CONNECTION_TEST')
	let config = {
		user: data.params.connection.user || data.params.connection.username || '',
		password: data.params.connection.password,
		server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
		database: data.params.connection.database,
		port: data.params.connection.port || 3306,
		options: {
			encrypt: true // Use this if you're on Windows Azure 
		}
	}
	let connection = mysql.createConnection(config)

	connection.connect(function(err) {
		if(!err) {
			connection.query('SELECT CURDATE() as T', function(err, rows, fields) {
				if(!err) {
					console.log(JSON.stringify(rows, null, 2))
					let result = { success: true, data: 'OK' }
					mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
				} else {
					let result = { success: false, error: { code: err.code, message: err.message } }
					mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
				}
			})
		} else {
			let result = { success: false, error: { code: 'MSQL_CONNECTION_ERROR', message: err.message } }
			mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
		}
	})


}

function saveLastQuery(query) {
	try {
		fs.writeFile('./last_query.sql', query, function(err) {
			if(err)
				errorLog('saveLastQuery err:', err)
		})
	} catch (err) {
		errorLog('saveLastQuery err:', err)
	}
}


function command_CMD(socket, data) {
	if(Array.isArray(data.params)) {
		data.params.forEach((e) => cmd.run(e))
		let result = { success: true, data: 'OK' }
		mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
	} else {
		cmd.get(data.params, (err, data, stderr) => {
			if(!stderr) {
				let result = { success: true, data: data }
				mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			} else {
				let result = { success: false, error: { code: 'CMD_ERROR', message: stderr } }
				mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			}
		})
	}

}

function command_UPDATE(socket, data) {
	if(os.platform() == 'win32') {
		mrutil.download(data.params.url, './update.zip', (err) => {
			if(!err) {
				try {
					cmd.get('7z.exe x update.zip -y', (err, data, stderr) => {
						if(stderr) {
							console.log('stderr:', stderr)
						}
						process.exit(0)
					})
				} catch (e) {
					let result = { success: false, error: { code: 'UNZIP_ERROR', message: (err.message || 'error') } }
					mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
				}
			} else {
				let result = { success: false, error: { code: 'DOWNLOAD_ERROR', message: (err.message || 'error') } }
				mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			}

		})
	} else {
		let result = { success: false, error: { code: 'ERROR', message: 'OS not supported' } }
		mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
	}
}



function runCommand(command) {
	return exec(command)
}

function execCmd(executeCommand, params, cb) {
	const cp = require('child_process')
	// const child = cp.spawn(exec, [fileName, '-e'])
	const child = cp.spawn(executeCommand, params)

	let buf = ''
	child.stdout.on('data', (c) => {
		buf += c
	})

	child.stderr.on('data', (data) => {
		cb({ name: 'child_process Error', message: data.toString('UTF-8') }, '', data.toString('UTF-8'))
	})

	child.stdout.on('end', () => {
		cb(null, buf.toString('UTF-8'), '')
	})
}

function command_JS(socket, data) {

	try {
		let extension = ''
		let execParams = []
		let exec = 'node'
		switch (data.command.toUpperCase()) {
			case 'JS':
				extension = '.js'
				exec = 'node.exe'
				break
			case 'WSCRIPT':
				extension = '.vbs'
				// execParams='/logo /h:wscript /i'
				execParams = ['/logo', '/h:wscript', '/i']
				exec = 'wscript.exe'
				break
			case 'CSCRIPT':
				extension = '.vbs'
				exec = 'cscript.exe'
				break
			case 'BAT':
				extension = '.bat'
				exec = ''
				break
			case 'BASH':
				extension = '.sh'
				exec = ''
				break
		}
		let fileName = path.join(os.tmpdir(), 'tr216_' + uuid.v4() + extension)

		if(exec == '') {
			exec = fileName
			fileName = ''
		} else {
			execParams.unshift(fileName)
		}

		let content = ''
		if(data.params.content != undefined) {
			content = data.params.content
		} else {
			content = data.params
		}

		fs.writeFile(fileName, content, 'utf8', (err) => {
			if(!err) {
				execCmd(exec, execParams, (err, veri, stderr) => {
					if(stderr.trim() == '') {
						let result = { success: true, data: veri }
						mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
						return
					} else {
						console.log('error:', err)
						let result = { success: false, error: { code: 'cmd_JS_ERROR', message: stderr } }
						mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
						return
					}
				})

			} else {
				errorLog('hata:', err)
				let result = { success: false, error: { code: 'cmd_JS_ERROR', message: (err.message || 'command_JS error') } }
				mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
			}
		})

	} catch (err) {
		errorLog('hata:', err)
		let result = { success: false, error: { code: 'cmd_JS_ERROR', message: (err.message || 'command_JS error') } }
		mrutil.socketwrite(socket, mrutil.resPackage(connectinfo, data.command, result, data.requestid))
	}



}