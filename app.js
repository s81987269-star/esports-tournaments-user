// ================= SPLASH =================

let progress = 0;
let authChecked = false;
let splashFinished = false;

setTimeout(() => {
    const splash = document.getElementById("splash");

    if (splash) {
        splash.style.display = "none";
    }
}, 8000);

const fill = document.getElementById("loadingFill");
const text = document.getElementById("loadingText");

const splashTimer = setInterval(() => {

    progress++;

    if (fill) {
        fill.style.width = progress + "%";
    }

    if (text) {
        text.innerText = progress + "%";
    }

    if (progress >= 100) {

        clearInterval(splashTimer);

        splashFinished = true;

        hideSplashIfReady();
    }

}, 30);


// ================= HIDE SPLASH =================

function hideSplashIfReady() {

    if (!authChecked || !splashFinished) {
        return;
    }

    const splash = document.getElementById("splash");

    if (splash) {
        splash.style.display = "none";
    }

}

    // NAVIGATION

    document.querySelectorAll(".navBtn").forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".navBtn").forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            document.querySelectorAll(".page").forEach(p => p.classList.remove("activePage"));

            document.getElementById(btn.dataset.page).classList.add("activePage");

        });

    });

// ================= PHONE AUTH =================

document.getElementById("sendOtpBtn").onclick = async () => {

    const phone = document.getElementById("phoneNumber").value.trim();

    if (!phone) {
        alert("Please enter phone number");
        return;
    }

    try {

        // Create Recaptcha only when Send OTP is clicked
        if (!window.recaptchaVerifier) {

            window.recaptchaVerifier =
                new firebase.auth.RecaptchaVerifier(
                    "recaptcha-container",
                    {
                        size: "normal"
                    }
                );

            await window.recaptchaVerifier.render();
        }

        const appVerifier = window.recaptchaVerifier;

        window.confirmationResult =
            await auth.signInWithPhoneNumber(
                phone,
                appVerifier
            );

        alert("OTP Sent");

    } catch (err) {

        console.error(err);
        alert(err.message);

    }

};


// ================= VERIFY OTP =================

document.getElementById("verifyOtpBtn").onclick = async () => {

    const code =
        document.getElementById("otpInput").value.trim();

    if (!code) {
        alert("Please enter OTP");
        return;
    }

    if (!window.confirmationResult) {
        alert("Please click Send OTP first");
        return;
    }

    try {

        const result =
            await window.confirmationResult.confirm(code);

        await saveUser(result.user);

    } catch (err) {

        console.error(err);
        alert(err.message);

    }

};

    // GOOGLE LOGIN

    document.getElementById("googleLoginBtn").onclick = async () => {

        const provider = new firebase.auth.GoogleAuthProvider();

        try {

            await auth.signInWithRedirect(provider);

        } catch (err) {

            alert(err.message);

            console.log(err);

        }

    };

    // GUEST LOGIN


    document.getElementById("guestLoginBtn").onclick = async () => {

        try {

            const result = await auth.signInAnonymously();
            saveUser(result.user);

            alert("Guest Login Success");

            document.getElementById("authPage").classList.add("hidden");

            document.getElementById("app").classList.remove("hidden");

        } catch (err) {

            alert(err.message);

            console.log(err);

        }

    };

    // SAVE USER

    async function saveUser(user) {

        const ref = db.collection("users").doc(user.uid);

        const doc = await ref.get();

        if (!doc.exists) {

            await ref.set({

                uid: user.uid,

                phone: user.phoneNumber || "",

                name: user.displayName || "Guest",

                wallet: 0,

                winning: 0,

                bonus: 0,

                createdAt: Date.now()

            });

        }

        document.getElementById("authPage").classList.add("hidden");

        document.getElementById("app").classList.remove("hidden");

loadUser();

startWalletRealtime();

loadWalletHistory();

loadTournaments();

loadTransactionHistory();

loadNotifications();

    }

// ================= AUTO LOGIN =================

auth.onAuthStateChanged(user => {

    const authPage = document.getElementById("authPage");
    const app = document.getElementById("app");

    authChecked = true;

    if (user) {

        // USER LOGGED IN

        if (authPage) {
            authPage.classList.add("hidden");
        }

        if (app) {
            app.classList.remove("hidden");
        }

loadUser();
setupPushNotifications();

startWalletRealtime();
loadWalletHistory();
loadTournaments();
loadTransactionHistory();
loadNotifications();
loadMyMatches();



    } else {

        // USER NOT LOGGED IN

        if (authPage) {
            authPage.classList.remove("hidden");
        }

        if (app) {
            app.classList.add("hidden");
        }

    }

    hideSplashIfReady();

});

    // LOAD USER

    async function loadUser() {

        const user = auth.currentUser;

        if (!user) return;

        const docSnap = await db.collection("users").doc(user.uid).get();

        if (!docSnap.exists) {

            await saveUser(user);
            return;

        }

        const data = docSnap.data() || {};

        document.getElementById("walletBalance").innerText = data.wallet || 0;
        document.getElementById("walletAmount").innerText = data.wallet || 0;
        document.getElementById("winningAmount").innerText = data.winning || 0;
        
        const profileEarnings = document.getElementById("profileEarnings");

if (profileEarnings) {
    profileEarnings.innerText = "₹" + (data.winning || 0);
}
        
        document.getElementById("bonusAmount").innerText = data.bonus || 0;

        document.getElementById("username").value = data.name || "";
        document.getElementById("ffuid").value = data.ffuid || "";
        document.getElementById("ign").value = data.ign || "";

        if (data.photo) {
            document.getElementById("profileImagePreview").src = data.photo;
        }

    }

    // ================= REALTIME USER WALLET =================

function startWalletRealtime() {

    const user = auth.currentUser;

    if (!user) return;

    db.collection("users")
        .doc(user.uid)
        .onSnapshot(doc => {

            if (!doc.exists) return;

            const data = doc.data() || {};

            const wallet = Number(data.wallet || 0);
            const winning = Number(data.winning || 0);
            const bonus = Number(data.bonus || 0);

            const walletBalance =
                document.getElementById("walletBalance");

            if (walletBalance) {
                walletBalance.innerText = wallet;
            }

            const walletAmount =
                document.getElementById("walletAmount");

            if (walletAmount) {
                walletAmount.innerText = wallet;
            }

            const winningAmount =
                document.getElementById("winningAmount");

            if (winningAmount) {
                winningAmount.innerText = winning;
            }

            const bonusAmount =
                document.getElementById("bonusAmount");

            if (bonusAmount) {
                bonusAmount.innerText = bonus;
            }

        }, error => {

            console.log(
                "Realtime wallet error:",
                error
            );

        });

}
    
    // SAVE PROFILE

    document.getElementById("saveProfileBtn").onclick = async () => {

        const user = auth.currentUser;

        const username = document.getElementById("username").value;

        const ffuid = document.getElementById("ffuid").value;

        const ign = document.getElementById("ign").value;

        let photoURL = "";

        const file = document.getElementById("profileImage").files[0];

        if (file) {

            const ref = storage.ref("profiles/" + user.uid);

            await ref.put(file);

            photoURL = await ref.getDownloadURL();

        }

        await db.collection("users").doc(user.uid).update({

            name: username,

            ffuid,

            ign,

            photo: photoURL

        });

        alert("Profile Saved");

        loadUser();

    };

    // LOAD TOURNAMENTS

    let allTournaments = [];

    function loadTournaments() {

        db.collection("tournaments")
            .onSnapshot(snapshot => {

                allTournaments = [];

                const container = document.getElementById("tournamentContainer");

                const featured = document.getElementById("featuredContainer");

                container.innerHTML = "";

                featured.innerHTML = "";

                for (const doc of snapshot.docs) {

                    allTournaments.push({
                        id: doc.id,
                        ...doc.data()
                    });

                    const t = doc.data();

                    const div = document.createElement("div");

                    div.className = "glass tournamentCard";

                    div.innerHTML = `

<img class="tournamentBanner" src="${t.bannerUrl || t.banner || 'assets/logo.png'}">

<h3>${t.name || t.title}</h3>

<p>Mode: ${t.type || t.mode}</p>

<p>Entry: ₹${t.fee ?? t.entryFee}</p>

<p>Prize: ₹${t.prize ?? t.prizePool}</p>

<p class="countdown" id="countdown-${doc.id}">⏳ Loading...</p>

<p>Slots: ${t.joinedPlayers || 0}/${t.slots ?? t.totalSlots}</p>

<div class="slotBar">
    <div class="slotFill"
    style="width:${((t.joinedPlayers || 0) / (t.slots ?? t.totalSlots)) * 100}%">
    </div>
</div>

<p class="slotsLeft">
${(t.slots ?? t.totalSlots) - (t.joinedPlayers || 0)} Slots Left
</p>
<button
class="joinBtn"
onclick="joinTournament('${doc.id}', ${t.fee ?? t.entryFee}, ${t.slots ?? t.totalSlots}, ${t.joinedPlayers || 0})">

⚡ Join Match

</button>

`;

                    container.appendChild(div);

                    startCountdown(doc.id, t.date, t.time);

                    if (featured.children.length >= 5) continue;

                    featured.appendChild(div.cloneNode(true));

                    startCountdown(doc.id, t.date, t.time);

                } // for loop khatam

            }); // onSnapshot khatam

    } // loadTournaments function khatam

    document.getElementById("searchTournament").addEventListener("input", filterTournaments);

    document.getElementById("filterTournament").addEventListener("change", filterTournaments);

    document.getElementById("sortTournament").addEventListener("change", filterTournaments);

    function filterTournaments() {

        const search = document.getElementById("searchTournament").value.toLowerCase();

        const mode = document.getElementById("filterTournament").value;

        const sort = document.getElementById("sortTournament").value;

        let list = [...allTournaments];

        if (search) {

            list = list.filter(t =>
                (t.name || t.title || "").toLowerCase().includes(search)
            );

        }

        if (mode !== "all") {

            list = list.filter(t =>
                (t.type || t.mode) === mode
            );

        }

        if (sort === "entryLow") {

            list.sort((a, b) => (a.fee ?? a.entryFee) - (b.fee ?? b.entryFee));

        }

        if (sort === "entryHigh") {

            list.sort((a, b) => (b.fee ?? b.entryFee) - (a.fee ?? a.entryFee));

        }

        if (sort === "prizeHigh") {

            list.sort((a, b) => (b.prize ?? b.prizePool) - (a.prize ?? a.prizePool));

        }

        const container = document.getElementById("tournamentContainer");

        container.innerHTML = "";

        list.forEach(t => {

            container.innerHTML += `
<div class="glass tournamentCard">

<img class="tournamentBanner"
src="${t.bannerUrl || t.banner || 'assets/logo.png'}">

<h3>${t.name || t.title}</h3>

<p>Mode : ${t.type || t.mode}</p>

<p>Entry : ₹${t.fee ?? t.entryFee}</p>

<p>Prize : ₹${t.prize ?? t.prizePool}</p>

<p>Slots : ${t.joinedPlayers || 0}/${t.slots ?? t.totalSlots}</p>

</div>
`;

        });

    }

    function startCountdown(id, date, time) {

        const el = document.getElementById("countdown-" + id);

        if (!el) return;

        let target;

        if (date && date.includes("T")) {
            target = new Date(date).getTime();
        } else {
            target = new Date(date + " " + time).getTime();
        }

        console.log("Date:", date, "Time:", time);

        const timer = setInterval(() => {

            const now = Date.now();

            const diff = target - now;

            if (diff <= 0) {

                el.innerHTML = "<span style='color:#00ff88'>🟢 LIVE</span>";

                clearInterval(timer);

                return;

            }

            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            el.innerHTML = `
<span style="color:#00ffff;">⏳</span>
<span style="color:#00ff88;">${d}d</span>
<span style="color:#00d4ff;"> ${h}h</span>
<span style="color:#ffd700;"> ${m}m</span>
<span style="color:#ff4d6d;"> ${s}s</span>
`;

        }, 1000);

    }

    // JOIN TOURNAMENT

    async function joinTournament(id, fee, totalSlots, joinedPlayers) {

        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Joining...";
        }

        const user = auth.currentUser;

        const joinRef = db.collection("joined_tournaments")
            .doc(user.uid + "_" + id);

        const already = await joinRef.get();

        if (already.exists) {

            if (btn) {
                btn.disabled = false;
                btn.innerText = "Join Match";
            }

            alert("Already Joined");

            return;

        }

        if (joinedPlayers >= totalSlots) {

            if (btn) {
                btn.disabled = false;
                btn.innerText = "Join Match";
            }

            alert("Slots Full");

            return;

        }

        const userRef = db.collection("users").doc(user.uid);

        const userDoc = await userRef.get();

        const wallet = userDoc.data().wallet || 0;

        if (wallet < fee) {

            if (btn) {
                btn.disabled = false;
                btn.innerText = "Join Match";
            }

            alert("Insufficient Balance");

            return;

        }

        const tournamentRef = db.collection("tournaments").doc(id);

        const tournamentDoc = await tournamentRef.get();
        const t = tournamentDoc.data();

        await db.runTransaction(async (transaction) => {

            transaction.update(userRef, {

                wallet: wallet - fee

            });

            transaction.set(joinRef, {

                userId: user.uid,

                tournamentId: id,

                joinedAt: Date.now(),

                playerName: userDoc.data().name || "Guest",
                ffuid: userDoc.data().ffuid || "",
                ign: userDoc.data().ign || "",

                title: t.name || t.title,
                banner: t.bannerUrl || t.banner || "",
                mode: t.type || t.mode,
                entryFee: t.fee ?? t.entryFee,
                prizePool: t.prize ?? t.prizePool,
                totalSlots: t.slots ?? t.totalSlots,
                date: t.date || "",
                time: t.time || "",
                roomId: t.roomId || "",
                roomPassword: t.roomPassword || "",
                revealTime: t.revealTime || 0,

            });

            transaction.update(tournamentRef, {

                joinedPlayers: joinedPlayers + 1

            });

        });

        await db.collection("wallet_transactions").add({

            uid: user.uid,

            type: "entry_fee",

            amount: fee,

            createdAt: Date.now()

        });

        alert("Joined Successfully");

        loadUser();

        setTimeout(() => {
            loadMyMatches();
        }, 300);

    }

// ================= WITHDRAWAL REQUEST =================

document.getElementById("withdrawBtn").onclick = async () => {

    const user = auth.currentUser;

    if (!user) {
        alert("Please login first");
        return;
    }

    const upi = document.getElementById("upiId").value.trim();

    const amount = Number(
        document.getElementById("withdrawAmount").value
    );

    if (!upi) {
        alert("Please enter UPI ID");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    if (amount < 50) {
        alert("Minimum withdrawal is ₹50");
        return;
    }

    const userRef = db.collection("users").doc(user.uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        alert("User profile not found");
        return;
    }

    const userData = userDoc.data();

    const wallet = Number(userData.wallet || 0);

    if (wallet < amount) {
        alert("Insufficient Balance");
        return;
    }

    try {

        await db.collection("withdrawals").add({

            uid: user.uid,

            upi: upi,

            amount: amount,

            status: "pending",

            createdAt: Date.now()

        });

        document.getElementById("upiId").value = "";

        document.getElementById("withdrawAmount").value = "";

        alert("Withdrawal request submitted successfully.");

    } catch (error) {

        console.error(error);

        alert("Withdrawal request failed.");

    }

};

    document.getElementById("myMatchesBtn").onclick = () => {

        const box = document.getElementById("myMatches");

        if (box.style.display === "block") {

            box.style.display = "none";

        } else {

            box.style.display = "block";

            loadMyMatches();

        }

    };

async function loadMyMatches() {

    const user = auth.currentUser;
    
    const matchesEl = document.getElementById("profileMatches");
const winsEl = document.getElementById("profileWins");
const earningsEl = document.getElementById("profileEarnings");

if (matchesEl) matchesEl.innerText = "0";
if (winsEl) winsEl.innerText = "0";
if (earningsEl) earningsEl.innerText = "₹0";

    if (!user) return;

    const box = document.getElementById("myMatches");

    box.innerHTML = "";

    const snapshot = await db.collection("joined_tournaments")
        .where("userId", "==", user.uid)
        .get();
        
        const totalMatches = snapshot.size;

if (matchesEl) {
    matchesEl.innerText = totalMatches;
}

    if (snapshot.empty) {
        box.innerHTML = `
        <p style="text-align:center">
            No Matches Joined Yet
        </p>
        `;
        return;
    }

    // Same tournament ko sirf ek baar show karne ke liye
    const shownTournaments = new Set();

    for (const doc of snapshot.docs) {

        const data = doc.data();

        const tournamentId = data.tournamentId;

        // Duplicate tournament skip
        if (!tournamentId || shownTournaments.has(tournamentId)) {
            continue;
        }

        shownTournaments.add(tournamentId);

        const tournamentDoc = await db.collection("tournaments")
            .doc(tournamentId)
            .get();

        if (!tournamentDoc.exists) {
            continue;
        }

        const t = tournamentDoc.data();

        const now = Date.now();

        const revealed =
            t.revealTime &&
            now >= Number(t.revealTime);

        // Reveal hone tak ek timer
        if (
            t.revealTime &&
            now < Number(t.revealTime)
        ) {

            const remaining = Number(t.revealTime) - now;

            setTimeout(() => {
                loadMyMatches();
                loadNotifications();
            }, remaining + 500);
        }

        box.innerHTML += `

        <div class="glass tournamentCard">

            <img
                class="tournamentBanner"
                src="${t.bannerUrl || t.banner || 'assets/logo.png'}"
            >

            <h3>🎮 ${t.name || t.title || "Tournament"}</h3>

            <p>🎯 Mode : ${t.type || t.mode || "--"}</p>

            <p>💰 Entry : ₹${t.fee ?? t.entryFee ?? 0}</p>

            <p>🏆 Prize : ₹${t.prize ?? t.prizePool ?? 0}</p>

            <p>
                👥 Slots :
                ${t.joinedPlayers || 0}/${t.slots ?? t.totalSlots ?? 0}
            </p>

            <p>📅 Date : ${t.date || "Coming Soon"}</p>

            <p>🕒 Time : ${t.time || "--:--"}</p>

            <p style="color:#00ff88;">
                ✅ Joined
            </p>

            ${
                revealed
                ? `
                <div style="
                    margin-top:12px;
                    padding:12px;
                    border:1px solid #00ffff;
                    border-radius:12px;
                ">

                    <h3 style="color:#00ffff;">
                        🎮 ROOM DETAILS
                    </h3>

                    <p>
                        🆔 Room ID :
                        <b>${t.roomId || "Not Available"}</b>
                    </p>

                    <button onclick="copyRoomId('${t.roomId || ""}')">
                        📋 Copy Room ID
                    </button>

                    <p>
                        🔑 Password :
                        <b>${t.roomPassword || "Not Available"}</b>
                    </p>

                </div>
                `
                : `
                <div style="
                    margin-top:12px;
                    padding:12px;
                    border:1px solid #ffaa00;
                    border-radius:12px;
                ">

                    <p style="color:#ffaa00;">
                        ⏳ Room ID & Password Not Released Yet
                    </p>

                </div>
                `
            }

        </div>

        `;
    }

}

    window.copyRoomId = function(roomId) {

        if (!roomId) {
            alert("Room ID Not Released Yet");
            return;
        }

        navigator.clipboard.writeText(roomId);

        alert("Room ID Copied");
    };

    // LOAD WALLET HISTORY

    async function loadWalletHistory() {

        const user = auth.currentUser;

        if (!user) return;

        const box = document.getElementById("walletHistory");

        box.innerHTML = "";

        db.collection("wallet_transactions")
            .where("uid", "==", user.uid)
            .orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {

                if (snapshot.empty) {

                    box.innerHTML = `
<p style="text-align:center;">
No Transactions Yet
</p>
`;

                    return;

                }

                snapshot.forEach(doc => {

                    const data = doc.data();

                    box.innerHTML += `
<div class="glass" style="margin:10px;padding:10px;">

<b>${data.type.replace("_"," ").toUpperCase()}</b>

<br>

₹${data.amount}

<br>

<small>
${new Date(data.createdAt).toLocaleString()}
</small>

</div>
`;

                });

            });

    }
    loadTransactionHistory();

    // LOGOUT

    document.getElementById("logoutBtn").onclick = async () => {

        await auth.signOut();

        location.reload();

    };

// ================= TRANSACTION HISTORY =================

function loadTransactionHistory() {

    const user = auth.currentUser;

    if (!user) return;

    const box = document.getElementById("walletHistory");

    if (!box) return;

    let allTransactions = [];

    // ---------- WALLET TRANSACTIONS ----------

    db.collection("wallet_transactions")
        .where("uid", "==", user.uid)
        .onSnapshot(snapshot => {

            allTransactions = [];

            snapshot.forEach(doc => {

                const data = doc.data();

                allTransactions.push({
                    type: data.type || "Transaction",
                    amount: Number(data.amount || 0),
                    status: data.status || "completed",
                    createdAt: data.createdAt || 0
                });

            });

            loadOtherTransactions();

        }, error => {

            console.log("Wallet history error:", error);

            loadOtherTransactions();

        });


    // ---------- RECHARGE + WITHDRAWAL ----------

    function loadOtherTransactions() {

        Promise.all([

            db.collection("payment_requests")
                .where("userId", "==", user.uid)
                .get(),

            db.collection("withdrawals")
                .where("uid", "==", user.uid)
                .get()

        ]).then(([rechargeSnapshot, withdrawalSnapshot]) => {

            // Recharge

            rechargeSnapshot.forEach(doc => {

                const data = doc.data();

                allTransactions.push({

                    type: "Recharge",

                    amount: Number(data.amount || 0),

                    status: data.status || "pending",

                    createdAt: data.createdAt || 0

                });

            });


            // Withdrawal

            withdrawalSnapshot.forEach(doc => {

                const data = doc.data();

                allTransactions.push({

                    type: "Withdrawal",

                    amount: Number(data.amount || 0),

                    status: data.status || "pending",

                    createdAt: data.createdAt || 0

                });

            });


            // Newest first

            allTransactions.sort((a, b) => {

                return Number(b.createdAt || 0) -
                       Number(a.createdAt || 0);

            });


            // Clear history

            box.innerHTML = "";


            if (allTransactions.length === 0) {

                box.innerHTML = `

                <div class="emptyWalletState">

                    <div>💰</div>

                    <p>
                        No Transactions Yet
                    </p>

                    <small>
                        Your wallet activity will appear here
                    </small>

                </div>

                `;

                return;

            }


            // Display

            allTransactions.forEach(data => {

                let status = String(data.status).toLowerCase();

                let icon = "💰";

                if (data.type === "Recharge") {

                    icon = "💳";

                }

                if (data.type === "Withdrawal") {

                    icon = "💸";

                }

                if (data.type === "entry_fee") {

                    icon = "🎮";

                }

                if (data.type === "winning") {

                    icon = "🏆";

                }


                let statusIcon = "⏳";

                if (status === "approved" ||
                    status === "completed" ||
                    status === "success") {

                    statusIcon = "✅";

                }

                if (status === "rejected") {

                    statusIcon = "❌";

                }


                let dateText = "";

                if (typeof data.createdAt === "number") {

                    dateText =
                        new Date(data.createdAt).toLocaleString();

                }


                box.innerHTML += `

                <div
                    class="glass"
                    style="
                        margin:10px;
                        padding:14px;
                    "
                >

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    ">

                        <div>

                            <b>
                                ${icon}
                                ${String(data.type)
                                    .replace("_"," ")
                                    .toUpperCase()}
                            </b>

                            <br>

                            <small>
                                ${dateText}
                            </small>

                        </div>


                        <strong>
                            ₹${data.amount}
                        </strong>

                    </div>


                    <div style="
                        margin-top:8px;
                        font-size:13px;
                    ">

                        ${statusIcon}
                        ${status.toUpperCase()}

                    </div>

                </div>

                `;

            });

        }).catch(error => {

            console.log(
                "Transaction history error:",
                error
            );

        });

    }

}

    document.getElementById("submitRecharge").onclick = async () => {

        const user = auth.currentUser;

        if (!user) {
            alert("Please login first");
            return;
        }

        const amount = Number(document.getElementById("rechargeAmount").value);
        const txn = document.getElementById("transactionId").value.trim();

        if (!amount || !txn) {
            alert("Enter Amount and Transaction ID");
            return;
        }

        await db.collection("payment_requests").add({
            userId: user.uid,
            amount: amount,
            txn: txn,
            status: "pending",
            createdAt: Date.now()
        });

        document.getElementById("rechargeAmount").value = "";
        document.getElementById("transactionId").value = "";

        alert("Recharge Request Submitted Successfully");

        loadTransactionHistory();

    };

    document.getElementById("notificationBell").onclick = () => {

        document.querySelectorAll(".page").forEach(p => {
            p.classList.remove("activePage");
        });

        document.getElementById("notificationPage").classList.add("activePage");

        window.latestNotificationTime = Number(window.latestNotificationTime || 0);

        localStorage.setItem(
            "lastSeenNotification",
            window.latestNotificationTime || 0
        );

        document.getElementById("notificationDot").style.display = "none";
    };

    document.getElementById("backFromNotification").onclick = () => {

        document.querySelectorAll(".page").forEach(p => {
            p.classList.remove("activePage");
        });

        document.getElementById("homePage").classList.add("activePage");

        document.querySelectorAll(".navBtn").forEach(b => {
            b.classList.remove("active");
        });

        document.querySelector('.navBtn[data-page="homePage"]').classList.add("active");
    };

    function loadNotifications() {

        const user = auth.currentUser;
        if (!user) return;
        db.collection("notifications").orderBy("createdAt", "desc").onSnapshot(async snapshot => {
            const box = document.getElementById("notificationList");
            const dot = document.getElementById("notificationDot");
            box.innerHTML = "";
            if (snapshot.empty) {
                box.innerHTML = "<p style='text-align:center'>No Notifications</p>";
                dot.style.display = "none";
                return;
            }
            const lastSeen = Number(localStorage.getItem("lastSeenNotification") || 0);
            let latestTime = 0;
            let hasNew = false;
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const createdTime = data.createdAt?.toMillis() || 0;
                if (createdTime > latestTime) {
                    latestTime = createdTime;
                }
                if (data.type === "room") {
                    const joined = await db.collection("joined_tournaments").where("userId", "==", user.uid).where("tournamentId", "==", data.tournamentId).get();
                    if (joined.empty) continue;
                    if (Date.now() < data.revealTime) {
                        continue;
                    }
                }
                if (createdTime > lastSeen) {
                    hasNew = true;
                }
                box.innerHTML += ` <div class="glass" style="margin:10px;padding:12px;"> <h3>${data.title}</h3> <p>${data.message}</p> </div> `;
            }
            window.latestNotificationTime = latestTime;
            dot.style.display = hasNew ? "block" : "none";
            
            setInterval(() => {

    const dot = document.getElementById("notificationDot");

    if (!dot) return;

    const now = Date.now();

    db.collection("joined_tournaments")
    .where("userId", "==", user.uid)
    .get()
    .then(async snapshot => {

        for (const doc of snapshot.docs) {

            const t = await db.collection("tournaments")
            .doc(doc.data().tournamentId)
            .get();

            if (!t.exists) continue;

            const data = t.data();

            if (
                data.revealTime &&
                now >= data.revealTime &&
                !localStorage.getItem("roomRedDot_" + doc.data().tournamentId)
            ) {

                localStorage.setItem(
                    "roomRedDot_" + doc.data().tournamentId,
                    "1"
                );

                dot.style.display = "block";
            }

        }

    });

}, 1000);
            
        });

    }
    
// ================= PUSH NOTIFICATION SETUP =================

async function setupPushNotifications() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        const supported = await firebase.messaging.isSupported();

        if (!supported) {
            console.log("FCM not supported in this browser");
            return;
        }

        const messaging = firebase.messaging();

        const registration =
            await navigator.serviceWorker.register(
                "./firebase-messaging-sw.js"
            );

        console.log("FCM service worker registered");

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied");
            return;
        }

        const token = await messaging.getToken({
            vapidKey: "BAdqUvk7RT1EWVeeWiS_Y8-zE0ZHD14z2PRVyb9dLEKFSejKBApO713wyNDZ4ROKzi8PpD4_A93wnCuD4XAtu_w",
            serviceWorkerRegistration: registration
        });

        if (!token) {
            console.log("FCM token not generated");
            return;
        }

        await db.collection("users")
            .doc(user.uid)
            .set({
                fcmToken: token
            }, {
                merge: true
            });

        console.log("FCM token saved successfully");

        messaging.onMessage((payload) => {

            console.log(
                "Foreground notification:",
                payload
            );

        });

    } catch (error) {

        console.error(
            "Push notification setup error:",
            error
        );

    }
}
