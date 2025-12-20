document.querySelectorAll('.note').forEach((note) => {
  note.addEventListener('click', () => {
    note.setAttribute('contenteditable', 'true');
    note.focus();
  });
});

