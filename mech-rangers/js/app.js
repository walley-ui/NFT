function initApp() {
    // Check if we are on the admin route or have the admin script loaded
    const isAdmin = typeof Admin !== 'undefined';

    if (isAdmin) {
        console.log("Welcome, Admin ix_prinx. Generator enabled.");
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('userInterface').style.display = 'none';
    } else {
        console.log("Public Bridge Mode Active.");
        document.getElementById('adminControls').style.display = 'none';
        document.getElementById('userInterface').style.display = 'block';
        Bridge.init();
    }
}
