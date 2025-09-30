# lista doble
class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.current = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            self.current = self.head
            return
        last = self.head
        while last.next:
            last = last.next
        last.next = new_node
        new_node.prev = last

    def delete(self, data):
        node = self.head
        while node:
            if node.data == data:
                if node.prev:
                    node.prev.next = node.next
                if node.next:
                    node.next.prev = node.prev
                if node == self.head:
                    self.head = node.next
                if node == self.current:
                    self.current = node.next or node.prev
                return True
            node = node.next
        return False

    def next_song(self):
        if self.current and self.current.next:
            self.current = self.current.next
            return self.current.data
        return None

    def prev_song(self):
        if self.current and self.current.prev:
            self.current = self.current.prev
            return self.current.data
        return None

    def get_current(self):
        return self.current.data if self.current else None

    def move_to_position(self, data, new_position):
        """Mover una canción a una nueva posición en la lista"""
        # Encontrar el nodo a mover
        node = self.head
        while node:
            if node.data == data:
                break
            node = node.next
        
        if not node:
            return False  # No se encontró la canción
        
        # Si es el único nodo, no hacer nada
        if not node.prev and not node.next:
            return True
        
        # Desconectar el nodo de su posición actual
        if node.prev:
            node.prev.next = node.next
        if node.next:
            node.next.prev = node.prev
        if node == self.head:
            self.head = node.next
        
        # Insertar en la nueva posición
        if new_position == 0:
            # Insertar al inicio
            node.prev = None
            node.next = self.head
            if self.head:
                self.head.prev = node
            self.head = node
        else:
            # Encontrar la posición objetivo
            current = self.head
            current_pos = 0
            
            while current and current_pos < new_position - 1:
                current = current.next
                current_pos += 1
            
            if not current:
                # Si la posición es mayor que la lista, insertar al final
                last = self.head
                while last.next:
                    last = last.next
                last.next = node
                node.prev = last
                node.next = None
            else:
                # Insertar después de current
                node.next = current.next
                node.prev = current
                if current.next:
                    current.next.prev = node
                current.next = node
        
        return True

    def get_all_songs(self):
        """Obtener todas las canciones en orden"""
        songs = []
        node = self.head
        while node:
            songs.append(node.data)
            node = node.next
        return songs

    def get_position(self, data):
        """Obtener la posición de una canción"""
        node = self.head
        position = 0
        while node:
            if node.data == data:
                return position
            node = node.next
            position += 1
        return -1