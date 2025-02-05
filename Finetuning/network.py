from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8080

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(b"<html><body><h1>Hello, World!</h1></body></html>")

def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, MyHandler)
    print(f"Serving on port {PORT}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
