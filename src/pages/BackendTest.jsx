import { useEffect } from "react";

export default function BackendTest() {

    function addUser() {
        console.log("Hello World")
        fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: "test@example.com",
            name: "Daniel"
        }),
        })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);
    }

  return (
    <button onClick={addUser}>Add User</button>
  );
}
