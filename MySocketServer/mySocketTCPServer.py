import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(("", 8282))
server_socket.listen(5)

print ("TCPServer Waiting for client on port 8484")

while 1:
	client_socket, address = server_socket.accept()
	print ("I got a connection from ", address)
	while 1:
		data = input('SEND( TYPE q or Q to Quit):')
		if(data == 'Q' or data == 'q'):
			client_socket.send (data.encode())
			client_socket.close()
			break;
		else:
			client_socket.send(data.encode())
		
		data = client_socket.recv(512).decode()
		if(data == 'q' or data == 'Q'):
			client_socket.close()
			break;
		else:
			print ("RECEIVED:" , data)
	break;
server_socket.close()
print("SOCKET closed... END")