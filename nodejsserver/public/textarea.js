// If the enter key is pressed within the 'text area', send the message
$("#message").keypress(function (e) {
    if(e.which == 13 && !e.shiftKey) {
        $(this).closest("form").submit();
        e.preventDefault();
    }
});
