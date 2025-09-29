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
