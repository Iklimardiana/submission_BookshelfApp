let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist(){
  if (typeof (Storage) === undefined){
    alert('Maaf browser Anda tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(RENDER_EVENT, function () {
  const unReadBookList = document.getElementById('incompleteBookshelfList');
  unReadBookList.innerHTML = '';

  const hasReadBookList = document.getElementById('completeBookshelfList');
  hasReadBookList.innerHTML = '';

  for (const toReadBook of books){
    const readBookElement = createElementBook(toReadBook);
    if (!toReadBook.isComplete){
      unReadBookList.append(readBookElement);
    } else{
      hasReadBookList.append(readBookElement)
    }
  }

  countBookshelf();
});

document.addEventListener(SAVED_EVENT, function(){
  console.log(localStorage.getItem(STORAGE_KEY));
})

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('input-book');
  const searchForm = document.getElementById('searchForm');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();    
    submitForm.reset();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBooks();
  });

  if(isStorageExist()){
    loadDataFromStorage();
  }
});

  function addBook(){
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const hasRead = document.getElementById('inputBookIsComplete').checked;
    
    let readStatus;

    if (hasRead) {
        readStatus = true;
      } else {
        readStatus = false;
      };

    const existingBook = books.find(book => book.title === bookTitle && book.author === bookAuthor && book.year === bookYear);
    if (existingBook) {
        return;
    }

    const generatedID = generatedId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, readStatus);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Succesfully Added!';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, 3000);
  }

  function generatedId(){
    return +new Date();
  }

  function generateBookObject(id, title, author, year, isComplete){
    return{
        id,
        title,
        author,
        year,
        isComplete
    }
  }

  function createElementBook(bookObject){
    const titleBook = document.createElement('h3');
    titleBook.classList.add('item-title');
    titleBook.innerText =bookObject.title;

    const authorBook = document.createElement('p');
    authorBook.classList.add('paragraph-author');
    authorBook.innerHTML = `${bookObject.author} <span>(${bookObject.year})</span>`;

    const bookContainer = document.createElement('div');
    bookContainer.append(titleBook, authorBook);

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("item-action");

    const container = document.createElement('div');
    container.classList.add('item');
    container.append(bookContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isComplete){
      const undoButton = document.createElement('button');
      undoButton.classList.add('undo-btn');
      undoButton.innerHTML = `<i class="fas fa-undo"></i>`

      undoButton.addEventListener('click', function(){
        undoBookFromHasRead(bookObject.id);

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'Succesfully Restored!';
        document.body.appendChild(toast);
        setTimeout(function() {
          toast.remove();
        }, 3000);
      });

      const trashButton = document.createElement('button');
      trashButton.classList.add('trash-btn');
      trashButton.innerHTML = `<i class="fas fa-trash"></i>`;

      trashButton.addEventListener('click', function(){
        deleteBook(bookObject.id);
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'Succesfully Deleted!';
        document.body.appendChild(toast);
        setTimeout(function() {
          toast.remove();
        }, 3000);
      });

      actionContainer.append(undoButton, trashButton);
      container.append(actionContainer);

    } else{
      const editButton = document.createElement('button');
      editButton.classList.add('edit-btn');
      editButton.innerHTML = `<i class="fas fa-edit"></i>`;

      editButton.addEventListener('click', function(){
        editBook(bookObject.id);
      });

      const finishButton = document.createElement("button");
      finishButton.classList.add("finished-btn");
      finishButton.innerHTML = `<i class="fas fa-check"></i>`;
  
      finishButton.addEventListener("click", () => {
        addBookToFinished(bookObject.id);

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'Succesfully Moved!';
        document.body.appendChild(toast);
        setTimeout(function() {
          toast.remove();
        }, 3000);
      });

      const trashButton = document.createElement('button');
      trashButton.classList.add('trash-btn');
      trashButton.innerHTML = `<i class="fas fa-trash"></i>`;

      trashButton.addEventListener('click', function(){
        deleteBook(bookObject.id);
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'Succesfully Deleted!';
        document.body.appendChild(toast);
        setTimeout(function() {
          toast.remove();
        }, 3000);
      });

      actionContainer.append(finishButton, editButton, trashButton);
      container.append(actionContainer);
    }

    return container;
  }


  
  function deleteBook(bookId){
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
  }

  function undoBookFromHasRead(bookId){
    const bookTarget = findBook(bookId);
    
    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
  }

  function addBookToFinished(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  function findBookIndex(bookId){
    for (const index in books){
      if(books[index].id === bookId){
        return index;
      }
    }

    return -1;
  }

  function editBook(bookId) {
    const book = findBook(bookId);
    const bookTitle = document.getElementById("inputBookTitle");
    const bookAuthor = document.getElementById("inputBookAuthor");
    const bookYear = document.getElementById("inputBookYear");
    const hasRead = document.getElementById("inputBookIsComplete");
    const submitButton = document.querySelector("#input-book > button");
  
    bookTitle.value = book.title;
    bookAuthor.value = book.author;
    bookYear.value = book.year;
    hasRead.checked = book.isComplete;
  
    submitButton.innerText = "Update Book";
    submitButton.onclick = () => {
      const updatedBook = generateBookObject(
        book.id,
        bookTitle.value,
        bookAuthor.value,
        bookYear.value,
        hasRead.checked
      );
      const bookIndex = findBookIndex(book.id);
      books[bookIndex] = updatedBook;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      document.dispatchEvent(new Event(RENDER_EVENT));
      
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = 'Succesfully Edited!';
      document.body.appendChild(toast);
      setTimeout(function() {
        toast.remove();
      }, 3000);

      submitButton.innerText = "Simpan";
      submitButton.onclick = () => addBook();
    };
  }
  
  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const todo of data) {
        books.push(todo);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function searchBooks() {
    let search = document.querySelector('#keyword').value;
    let returnSearch = document.getElementsByClassName('item');

    for (const book of returnSearch) {
        let book_title = book.innerText.toUpperCase();
        let search_book = book_title.search(search.toUpperCase());
        if (search_book != -1) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    }
}

const countBookshelf = () => {
  let hasRead = [];
  let unRead = [];

  books.filter((book) => {
      if (book.isComplete === true) {
          hasRead.push(book);
      } else {
          unRead.push(book);
      }
  });

  document.getElementById("count_allBook").innerText = books.length;
  document.getElementById("count_hasRead").innerText = hasRead.length++;
  document.getElementById("count_unRead").innerText = unRead.length++;
};
  
  