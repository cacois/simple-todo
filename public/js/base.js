$(document).ready(function () {
  // keep list of todos
  todos = [];

  // enter key adds task
  $(".new-todo").keypress(function (event) {
    if (event.keyCode == 13) {
      todo = {
        text: event.target.value,
        complete: false
      };
      addTodo(todo);
      this.value = "";
    }
  });

  // load todos from DB on page load
  $.getJSON("/todos", function (data) {
    console.log(`${data.length} todos loaded from DB`);
    todos = data;
    displayTodos();
  });
});

function addTodo(todo) {
  if (todo.text != "undefined" && todo.text != "") {
    // add todo to list
    todos.push(todo);
    // update display
    displayTodos();
    writeTodos();
  }
}

function displayTodos() {
  // clear list
  $(".todo-list").empty();

  // write todos
  todos.forEach((todo, index) => {
    $(".todo-list").append(
      `<li><div class="view"><input id="${index}" class="toggle" type="checkbox" ${todo.complete ? 'checked' : ''}><label>${todo.text}</label><button id="${index}" class="destroy"></button></div></li>`
    );

    // on destroy click
    $(`button#${index}.destroy`).click(function (event) {
      todos.splice(index, 1);
      // refresh display
      displayTodos();
      writeTodos();
    });

    // on complete click
    $(`input#${index}`).click(function (event) {
      if (event.target.checked == true) {
        todos[index].complete = 1;
      } else {
        todos[index].complete = 0;
      }
      displayTodos();
      writeTodos();
    });
  });
}

function writeTodos() {
  $.ajax({
    type: 'PUT',
    url: '/todos',
    contentType: 'application/json',
    data: JSON.stringify(todos),
  }).done(function () {
    console.log('todos successfully written to db');
  }).fail(function (textStatus, error) {
    console.error(`failed to write todos to db: ${JSON.stringify(textStatus)}, ${JSON.stringify(error)}}`);
  });
}
