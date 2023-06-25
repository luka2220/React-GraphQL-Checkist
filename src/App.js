import React, { useState } from "react";

// Apollo hooks
import { useQuery, useMutation, gql } from "@apollo/client";

// list todos
// add todos
// toggle todos
// delete todos

// GraphQL query for retrieving all list data
const GET_TODOS = gql`
  query GetTodos {
    todos {
      text
      id
      done
    }
  }
`;

// GraphQL toggle todo mutation
const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        text
        id
        done
      }
    }
  }
`;

// GraphQL mutation for adding new todo to backend
const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    insert_todos(objects: { text: $text }) {
      returning {
        text
        id
        done
      }
    }
  }
`;

// GraphQL mutation for deleting a given todo based on id
const DELETE_TODO = gql`
  mutation DeleteTodo($id: uuid!) {
    delete_todos(where: { id: { _eq: $id } }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

function App() {
  // Storing result of GET_TODOS query in useQuery apollo hook
  const { loading, error, data } = useQuery(GET_TODOS);
  // Toggle todo mutation
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  // Adding todo to Hasura backend
  const [addTodo] = useMutation(ADD_TODO, {
    // onCompleted callback exectutes when our useMutation is completed
    onCompleted: () => setTodoText(""),
  });
  // Updated todos with deleted item
  const [deleteTodo] = useMutation(DELETE_TODO);

  // User Form state
  const [todoText, setTodoText] = useState("");

  // Functions
  async function handleToggleTodo({ id, done }) {
    await toggleTodo({ variables: { id: id, done: !done } });
  }

  async function handleAddTodo(e) {
    e.preventDefault();

    // Check if todo text is empty
    if (!todoText.trim()) return;
    await addTodo({
      variables: { text: todoText },

      // Re-executes our GET_TODOS query after adding a new todo
      refetchQueries: [{ query: GET_TODOS }],
    });
  }

  async function handleDeleteTodo({ id }) {
    const isConfirmed = window.confirm("Do you want to delete this todo?");

    if (!isConfirmed) return;

    await deleteTodo({
      variables: { id: id },
      // Updating the internal cache (Reading previous value, Writting new value)
      update: (cache) => {
        // Reading previous todos list from cache
        const prevData = cache.readQuery({ query: GET_TODOS });
        const updatedTodos = prevData.todos.filter((todo) => todo.id !== id);

        // Writing to the cache with updated todos
        cache.writeQuery({ query: GET_TODOS, data: { todos: updatedTodos } });
      },
    });
  }

  // Conditional renders
  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error fetching todos</div>;

  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-l">
        GraphQL CheckList{" "}
        <span role="img" aria-label="Checkmark">
          ✅
        </span>
      </h1>

      {/* Todo Form */}
      <form className="mb3" onSubmit={handleAddTodo}>
        <input
          className="pa2 f4 b--dashed"
          type="text"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          placeholder="Write your todo"
        />
        <button className="pa2 f4 bg-green" type="submit">
          Create
        </button>
      </form>

      {/* Todo List  */}
      <div className="flex items-center justify-center flex-column">
        {data.todos.map((todo) => (
          <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
            <span className={`pointer list pa1 f3 ${todo.done && "strike"}`}>
              {todo.text}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo)}
              className="bg-transparent f4 bn ph3"
            >
              {" "}
              <span className="red">&times;</span>
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
