//create firebase reference
var dbRef = new Firebase("https://contactsbooks.firebaseio.com/");
var contactsRef = dbRef.child('contacts')
var usersRef = dbRef.child('users')
var auth = null;
var auth = null;


//Register
$('#doRegister').on('click', function (e) {
  e.preventDefault();
  $('#registerModal').modal('hide');
  $('#messageModalLabel').html('<span class="text-center text-info"><i class="fa fa-cog fa-spin"></i></span>');
  $('#messageModal').modal('show');

  if( $('#registerEmail').val() != '' && $('#registerPassword').val() != ''  && $('#registerConfirmPassword').val() != '' ){
    if( $('#registerPassword').val() == $('#registerConfirmPassword').val() ){
      //create the user
      dbRef.createUser({
        email    : $('#registerEmail').val(),
        password : $('#registerPassword').val()
      }, function(error, userData) {
        if (error) {
          console.log("Error creating user:", error);
          $('#messageModalLabel').html('<span class="text-danger">ERROR: '+ error.code + '</span>')
        } else {
          //now user is needed to be logged in to save data
          dbRef.authWithPassword({
            email    : $('#registerEmail').val(),
            password : $('#registerPassword').val()
          }, function(error, authData) {
            if (error) {
              console.log("Login Failed!", error);
              $('#messageModalLabel').html('<span class="text-danger">ERROR: '+ error.code + '</span>')
            } else {
              console.log("Authenticated successfully with payload:", authData);
              auth  = authData;
              //now saving the profile data
              usersRef
                .child(userData.uid)
                .set({
                    firstName    : $('#registerFirstName').val(),
                    lastName    : $('#registerLastName').val(),
                    email    : $('#registerEmail').val(),
                  }, function(){
                    console.log("User Information Saved:", userData.uid);
                  })
              $('#messageModalLabel').html('<span class="text-center text-success">Success!</span>')
              //hide the modal automatically
              setTimeout(  function () {
                $('#messageModal').modal('hide');
                $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
                contactsRef        
                  .child(auth.uid)
                  .on("child_added", function(snap) {
                    console.log("added", snap.key(), snap.val());
                    $('#contacts').append(contactHtmlFromObject(snap.val()));
                  });
              }, 500)
            }
          });
          console.log("Successfully created user account with uid:", userData.uid);
          $('#messageModalLabel').html('<span class="text-success">Successfully created user account!</span>')
        }
      });
    } else {
      //password and confirm password didn't match
      $('#messageModalLabel').html('<span class="text-danger">ERROR: Passwords didn\'t match</span>')
    }
  }  
});

//Login
$('#doLogin').on('click', function (e) {
  e.preventDefault();
  $('#loginModal').modal('hide');
  $('#messageModalLabel').html('<span class="text-center text-info"><i class="fa fa-cog fa-spin"></i></span>');
  $('#messageModal').modal('show');

  if( $('#loginEmail').val() != '' && $('#loginPassword').val() != '' ){
    //login the user
    dbRef.authWithPassword({
      email    : $('#loginEmail').val(),
      password : $('#loginPassword').val()
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
        $('#messageModalLabel').html('<span class="text-danger">ERROR: '+ error.code + '</span>')
      } else {
        console.log("Authenticated successfully with payload:", authData);
        auth  = authData;
        $('#messageModalLabel').html('<span class="text-center text-success">Success!</span>')
        setTimeout(  function () {
          $('#messageModal').modal('hide');
          $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
          contactsRef        
            .child(auth.uid)
            .on("child_added", function(snap) {
              console.log("added", snap.key(), snap.val());
              $('#contacts').append(contactHtmlFromObject(snap.val()));
            });
        })
      }
    });
  }
});

//save contact
$('.addValue').on("click", function( event ) {  
    event.preventDefault();
    if( auth != null ){
      if( $('#name').val() != '' || $('#email').val() != '' ){
        contactsRef
          .child(auth.uid)
          .push({
            name: $('#name').val(),
            email: $('#email').val(),
            location: {
              city: $('#city').val(),
              state: $('#state').val(),
              zip: $('#zip').val()
            }
          })
          document.contactForm.reset();
      } else {
        alert('Please fill atlease name or email!');
      }
    } else {
      //inform user to login
    }
  });
 
//prepare conatct object's HTML
function contactHtmlFromObject(contact){
  console.log( contact );
  var html = '';
  html += '<li class="list-group-item contact">';
    html += '<div>';
      html += '<p class="lead">'+contact.name+'</p>';
      html += '<p>'+contact.email+'</p>';
      html += '<p><small title="'
                +contact.location.zip+'">'
                +contact.location.city
                +', '
                +contact.location.state
                +'</small></p>';
    html += '</div>';
  html += '</li>';
  return html;
}
