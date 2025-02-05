#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>

#define PORT 8080
#define BUFFER_SIZE 1024

void *handle_client(void *client_socket) {
    int sock = *(int *)client_socket;
    free(client_socket);
    char buffer[BUFFER_SIZE];
    read(sock, buffer, BUFFER_SIZE - 1);
    
    printf("Received request:\n%s\n", buffer);

    char response[] = 
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/html\r\n"
        "Content-Length: 45\r\n"
        "Connection: close\r\n\r\n"
        "<html><body><h1>Hello, World!</h1></body></html>";

    write(sock, response, sizeof(response) - 1);
    close(sock);
    return NULL;
}

int main() {
    int server_fd, *new_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == -1) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 10) < 0) {
        perror("Listen failed");
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port %d...\n", PORT);

    while (1) {
        int client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        if (client_fd < 0) {
            perror("Accept failed");
            continue;
        }

        pthread_t thread;
        new_sock = malloc(sizeof(int));
        *new_sock = client_fd;
        pthread_create(&thread, NULL, handle_client, (void *)new_sock);
        pthread_detach(thread);
    }

    close(server_fd);
    return 0;
}
