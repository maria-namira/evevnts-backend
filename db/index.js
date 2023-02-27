class Database {
  constructor() {
    this.clients = new Map();
    this.chat = [];
  }

  getDate() {
    const formatter = new Intl.DateTimeFormat("ru", {
      timeZone: "Europe/Moscow",
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    return formatter.format(new Date());
  }

  addMes(data) {
    this.chat.push({
      name: data.name,
      message: data.content,
      created: this.getDate(),
    });
    return this.chat;
  }

  addClient(ws, name) {
    this.clients.set(ws, name);
  }

  checkName(name) {
    const arr = [...this.clients.values()];
    return arr.some((e) => e === name);
  }

  getActiveClients() {
    const result = [];
    this.clients.forEach((value, key) => {
      if (key.readyState === 1) {
        result.push(value);
      }
    });
    return result;
  }

  delete(ws) {
    this.clients.delete(ws);
  }
}

module.exports = Database;