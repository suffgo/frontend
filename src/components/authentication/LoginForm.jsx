// src/components/LoginForm.jsx
import React, { useState } from "react";
import "../css/LoginForm.css";

const LoginForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    try {
      const response = await fetch("http://localhost:3000/v1/users/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        const userName = data.user.name;
        localStorage.setItem("userName", userName);

        window.location.href = "/protected/menu";
      } else {
        const data = await response.json();
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      setError("Error en la conexión con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fillRule="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          <input
            type="text"
            className="grow"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            name="username"
            required
          />
        </label>
      </div>
      <div>
        <label className="input input-bordered flex items-center gap-2 mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fillRule="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            name="password"
            required
          />
        </label>
      </div>
      {error && <div className="mt-2 font-semibold" style={{ color: "red" }}>{error}</div>}
      <div className="flex justify-center items-center p-5">
      <button type="submit" className="btn btn-primary"> 
        Iniciar Sesión
      </button>
      </div>
      <p className="text-slate-600">Todavía no tienes cuenta? <a href="/auth/register" className="register-text"> Registrese aqui</a></p>
      
    </form>
  );
};

export default LoginForm; 