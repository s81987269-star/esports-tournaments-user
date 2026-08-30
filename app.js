// SPLASH

let progress = 0;

const interval = setInterval(() => {

progress++;

document.getElementById("loadingFill").style.width = progress + "%";

document.getElementById("loadingText").innerText = progress + "%";

if(progress >= 100){

clearInterval(interval);

document.getElementById("splash").style.display = "none";

document.getElementById("authPage").classList.remove("hidden");

}

}, 30);

// NAVIGATION

document.querySelectorAll(".navBtn").forEach(btn=>{

btn.addEventListener("click", ()=>{

document.querySelectorAll(".navBtn").forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

document.querySelectorAll(".page").forEach(p=>p.classList.remove("activePage"));

document.getElementById(btn.dataset.page).classList.add("activePage");

});

});

// PHONE AUTH

window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
"recaptcha-container",
{
size:"normal"
}
);

document.getElementById("sendOtpBtn").onclick = async ()=>{

const phone = document.getElementById("phoneNumber").value;

const appVerifier = window.recaptchaVerifier;

try{

window.confirmationResult = await auth.signInWithPhoneNumber(phone, appVerifier);

alert("OTP Sent");

}catch(err){

alert(err.message);

}

};

document.getElementById("verifyOtpBtn").onclick = async ()=>{

const code = document.getElementById("otpInput").value;

try{

const result = await window.confirmationResult.confirm(code);

saveUser(result.user);

}catch(err){

alert(err.message);

}

};

// GOOGLE LOGIN

document.getElementById("googleLoginBtn").onclick = async ()=>{

const provider = new firebase.auth.GoogleAuthProvider();

try{

const result = await auth.signInWithPopup(provider);

saveUser(result.user);

}catch(err){

alert(err.message);

}

};

// GUEST LOGIN

document.getElementById("guestLoginBtn").onclick = async ()=>{

try{

const result = await auth.signInAnonymously();

saveUser(result.user);

}catch(err){

alert(err.message);

}

};

// SAVE USER

async function saveUser(user){

const ref = db.collection("users").doc(user.uid);

const doc = await ref.get();

if(!doc.exists){

await ref.set({

uid:user.uid,

phone:user.phoneNumber || "",

name:user.displayName || "Guest",

wallet:0,

winning:0,

bonus:0,

createdAt:Date.now()

});

}

document.getElementById("authPage").classList.add("hidden");

document.getElementById("app").classList.remove("hidden");

loadUser();

loadTournaments();

}

// AUTO LOGIN

auth.onAuthStateChanged(user=>{

if(user){

document.getElementById("splash").style.display = "none";

document.getElementById("authPage").classList.add("hidden");

document.getElementById("app").classList.remove("hidden");

loadUser();

loadTournaments();

}

});

// LOAD USER

async function loadUser(){

const user = auth.currentUser;

const doc = await db.collection("users").doc(user.uid).get();

const data = doc.data();

document.getElementById("walletBalance").innerText = data.wallet || 0;

document.getElementById("walletAmount").innerText = data.wallet || 0;

document.getElementById("username").value = data.name || "";

document.getElementById("ffuid").value = data.ffuid || "";

document.getElementById("ign").value = data.ign || "";

if(data.photo){

document.getElementById("profileImagePreview").src = data.photo;

}

}

// SAVE PROFILE

document.getElementById("saveProfileBtn").onclick = async ()=>{

const user = auth.currentUser;

const username = document.getElementById("username").value;

const ffuid = document.getElementById("ffuid").value;

const ign = document.getElementById("ign").value;

let photoURL = "";

const file = document.getElementById("profileImage").files[0];

if(file){

const ref = storage.ref("profiles/" + user.uid);

await ref.put(file);

photoURL = await ref.getDownloadURL();

}

await db.collection("users").doc(user.uid).update({

name:username,

ffuid,

ign,

photo:photoURL

});

alert("Profile Saved");

loadUser();

};

// LOAD TOURNAMENTS

function loadTournaments(){

db.collection("tournaments")
.onSnapshot(snapshot=>{

const container = document.getElementById("tournamentContainer");

const featured = document.getElementById("featuredContainer");

container.innerHTML = "";

featured.innerHTML = "";

snapshot.forEach(doc=>{

const t = doc.data();

const div = document.createElement("div");

div.className = "glass tournamentCard";

div.innerHTML = `

<img class="tournamentBanner" src="${t.banner}">

<h3>${t.title}</h3>

<p>Mode: ${t.mode}</p>

<p>Entry: ₹${t.entryFee}</p>

<p>Prize: ₹${t.prizePool}</p>

<p>Slots: ${t.joinedPlayers || 0}/${t.totalSlots}</p>

<button onclick="joinTournament('${doc.id}', ${t.entryFee}, ${t.totalSlots}, ${t.joinedPlayers || 0})">

Join Match

</button>

`;

container.appendChild(div);

featured.appendChild(div.cloneNode(true));

});

});

}

// JOIN TOURNAMENT

async function joinTournament(id, fee, totalSlots, joinedPlayers){

const user = auth.currentUser;

const joinRef = db.collection("joined_tournaments")
.doc(user.uid + "_" + id);

const already = await joinRef.get();

if(already.exists){

alert("Already Joined");

return;

}

if(joinedPlayers >= totalSlots){

alert("Slots Full");

return;

}

const userRef = db.collection("users").doc(user.uid);

const userDoc = await userRef.get();

const wallet = userDoc.data().wallet || 0;

if(wallet < fee){

alert("Insufficient Balance");

return;

}

await db.runTransaction(async(transaction)=>{

transaction.update(userRef, {

wallet: wallet - fee

});

transaction.set(joinRef, {

userId:user.uid,

tournamentId:id,

joinedAt:Date.now()

});

});

await db.collection("wallet_transactions").add({

uid:user.uid,

type:"entry_fee",

amount:fee,

createdAt:Date.now()

});

alert("Joined Successfully");

}

// RECHARGE

document.getElementById("submitRecharge").onclick = async ()=>{

const user = auth.currentUser;

const amount = document.getElementById("rechargeAmount").value;

const txn = document.getElementById("transactionId").value;

const file = document.getElementById("paymentScreenshot").files[0];

if(!file){

alert("Upload Screenshot");

return;

}

const ref = storage.ref("payments/" + Date.now());

await ref.put(file);

const url = await ref.getDownloadURL();

await db.collection("payment_requests").add({

uid:user.uid,

amount,

txn,

screenshot:url,

status:"pending",

createdAt:Date.now()

});

alert("Recharge Submitted");

};

// WITHDRAW

document.getElementById("withdrawBtn").onclick = async ()=>{

const user = auth.currentUser;

const upi = document.getElementById("upiId").value;

const amount = Number(document.getElementById("withdrawAmount").value);

const userRef = db.collection("users").doc(user.uid);

const doc = await userRef.get();

const wallet = doc.data().wallet || 0;

if(wallet < amount){

alert("Insufficient Balance");

return;

}

await userRef.update({

wallet: wallet - amount

});

await db.collection("withdrawals").add({

uid:user.uid,

upi,

amount,

status:"pending",

createdAt:Date.now()

});

alert("Withdrawal Submitted");

loadUser();

};

// LOGOUT

document.getElementById("logoutBtn").onclick = async ()=>{

await auth.signOut();

location.reload();

};