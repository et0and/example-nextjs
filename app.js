let magic = new Magic('pk_live_6420A7D201AAF767');

 /* 3️⃣ Implement Render Function */
 const render = async () => {
    const isLoggedIn = await magic.user.isLoggedIn();

/* Show login form if user is not logged in */
let html = `
<img class="rotating px-4 w-30 h-30" src="logo.png">
<h1 class="text-2xl font-bold mb-6">Please sign up or login</h1>
<h5 class="text-base mb-6">Only Kāhui Ako schools are permitted to sign up</h5>
<form onsubmit="handleLogin(event)" class="space-y-4">
  <input type="email" name="email" required="required" placeholder="Enter your email" class="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:bg-gray-200" />
  <button type="submit" class="block w-full py-2 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-700">Send</button>
</form>
`;

if (isLoggedIn) {
/* Get user metadata including email */
const userMetadata = await magic.user.getMetadata();
html = `
<h1 class="text-2xl font-bold mb-6">Current user: ${userMetadata.email}</h1>
<form onsubmit="handleUpload(event)" class="space-y-4">
  <input type="file" name="glbFile" id="glbFile" accept=".glb" required="required" class="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" />
  <button type="submit" class="block w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Upload GLB</button>
</form>
<button onclick="handleLogout()" class="block w-full py-2 px-4 mt-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Logout</button>
<div id="modelViewerContainer" class="mt-8"></div>
`;
}

const handleUpload = async (e) => {
e.preventDefault();

// Get the .glb file from the input
const glbFile = document.getElementById("glbFile").files[0];
if (!glbFile) return;

// Send the file to the server-side API route
const formData = new FormData();
formData.append("glbFile", glbFile);
const response = await fetch("/api/upload", {
method: "POST",
body: formData,
});

if (response.ok) {
// Get the file URL from the server response
const data = await response.json();
const fileUrl = data.fileUrl;

// Display the model using the <model-viewer> web component
const modelViewerContainer = document.getElementById("modelViewerContainer");
modelViewerContainer.innerHTML = `
  <model-viewer src="${fileUrl}" alt="3D model" auto-rotate camera-controls ar ar-modes="webxr scene-viewer quick-look" ar-scale="auto" style="width: 100%; height: 400px;"></model-viewer>
`;
} else {
alert("Error uploading file");
}
};

document.getElementById("app").innerHTML = html;
};

  /* 4️⃣ Implement Login Handler */
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    if (email) {
      /* One-liner login with email OTP 🤯 */
      await magic.auth.loginWithEmailOTP({ email });
      render();
    }
  };

  /* 5️⃣ Implement Logout Handler */
  const handleLogout = async () => {
    await magic.user.logout();
    render();
  };

  document.addEventListener('DOMContentLoaded', render);
