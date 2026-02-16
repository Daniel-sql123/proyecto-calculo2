export class StorageService {
  constructor() {
    if (!window.localStorage) {
      throw new Error("El almacenamiento local no está soportado en este navegador.");
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error al guardar en el almacenamiento local:", error);
    }
  }

  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error al leer del almacenamiento local:", error);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error al eliminar del almacenamiento local:", error);
    }
  }

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error al limpiar el almacenamiento local:", error);
    }
  }

  loadUsers() {
    try {
      const users = localStorage.getItem("users");
      return users ? JSON.parse(users) : {};
    } catch (error) {
      console.error("Error al cargar los usuarios desde el almacenamiento local:", error);
      return {};
    }
  }

  saveUsers(users) {
    try {
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error("Error al guardar los usuarios en el almacenamiento local:", error);
    }
  }

  loadSession() {
    try {
      const session = localStorage.getItem("session");
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error("Error al cargar la sesión desde el almacenamiento local:", error);
      return null;
    }
  }

  saveSession(session) {
    try {
      localStorage.setItem("session", JSON.stringify(session));
    } catch (error) {
      console.error("Error al guardar la sesión en el almacenamiento local:", error);
    }
  }

  clearSession() {
    try {
      localStorage.removeItem("session");
    } catch (error) {
      console.error("Error al eliminar la sesión del almacenamiento local:", error);
    }
  }
}