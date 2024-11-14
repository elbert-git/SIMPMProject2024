async function fromURL(url, parent) {
    //load html
    const html = await fetch(url);
    const text = await html.text();
    // render non script elements
    const div = document.createElement("div");
    div.innerHTML = text;
    Array.from(div.children).forEach((element) => {
        if (element.tagName.toLowerCase() !== "script") {
            parent.appendChild(element);
        }
    });
    // attach scritp elements
    Array.from(div.getElementsByTagName("script")).forEach((script) => {
        const newScript = document.createElement("script");
        if (script.src) {
            newScript.src = script.src;
            newScript.defer = true; // Load in order
        } else {
            newScript.textContent = script.textContent;
        }
        parent.appendChild(newScript);
    });
}

function renderOneRoomForAdmin(price, roomCapacity, roomName, id, isActive, earliestBookingTime, latestBookingTime) {
    return `
    <div class="details-container">
      <div class="room-image">
        <img src="./assets/meetingRoom.jpg" alt="Room Image" />
      </div>

      <div class="booking-info">
        <h2 >${roomName}</h2>

        <div>
          <p><strong>Capacity:</strong> <span >${roomCapacity}</span></p>
        </div>

        <div class="amount">
          <p>
            <strong>Rent per Day:</strong> $<span >${price}</span>
          </p>
        </div>
        <div class="amount">
          <p>
            <strong>Available for booking:</strong> <span >${isActive ? "<span style='color:green'>yes</span>" : "<span style='color:red'>no</span>"}</span>
          </p>
        </div>

        <div class="amount">
          <p>
            <strong>Earliest booking time:</strong> <span >${earliestBookingTime}</span>
          </p>
        </div>

        <div class="amount">
          <p>
            <strong>latest booking time:</strong> <span >${latestBookingTime}</span>
          </p>
        </div>

        <button class="buttons room-edit-button" onclick="onEditButtonClicked('${id}')"> Edit </button>
      </div>
    </div>
    `;
}



async function allRooms(parentElement) {
    try {
        // clear page and creat style
        parentElement.innerHTML = `
            <style>
                .details-container{
                    display: flex; 
                    height: 15rem;
                    margin: 1rem 0rem;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    max-width: 1000px;
                    width: 100%;
                }
                img { height: 100%}
                .booking-info{
                    padding: 0.25rem 1rem
                }
                .buttons{
                    margin: 1rem 0rem
                }
                h2{
                    margin:1rem 0rem
                }
            </style>
        `;
        // get data
        const res = await auth.getAllRooms();
        console.log(res)
        // render elements
        res.rooms.forEach((roomData) => {
            parentElement.innerHTML += renderOneRoomForAdmin(
                roomData.pricePerHour,
                roomData.roomCapacity,
                roomData.roomName,
                roomData.roomId,
                roomData.isActive,
                roomData.earliestBookingTime,
                roomData.latestBookingTime,
            );
        });
    } catch (error) {
        console.log(error);
    }
}

async function renderBookings(parentElement) {
    // get bookings
    const res = await window.auth.getBookingsByUserEmail(window.auth.state.credentials.email)
    const bookings = res.bookings
    // get room data to get names
    const resRooms = await window.auth.getAllRooms()
    const rooms = resRooms.rooms
    // style elements
    parentElement.innerHTML = `
        <style>
            .booking-card{
                display: flex;
                height: 10rem;
                margin: 1rem;
            }
            .booking-card img{
                height: 100%; border-radius: 0.5rem;
            }
            .booking-details{
                flex-grow: 1;
                padding: 0rem 1rem;
            }
            .booking-details h3{
                margin-bottom: 0.5rem;
            }
            .booking-details .buttons{
                margin-top: 0.5rem;
                width: 100%;
            }
                @media (max-width: 600px) {
                    .booking-card {
                        flex-direction: column;
                        height: fit-content;
                    }
                    img { width: 100%; height: auto !important; }
                }
        </style> 
    `
    bookings.forEach((booking) => {
        const roomData = rooms.find((room) => {
            return room.roomId === booking.roomId
        });
        if (roomData) {
            if (isTodayOrFutureDate(booking.date)) {
                parentElement.innerHTML += `<div class="booking-card">
                <img src="./assets/meetingRoom.jpg"/>
                <div class="booking-details">
                    <h3>${roomData.roomName}</h3>
                    <div><strong>Date:</strong> ${booking.date}</div>
                    <div><strong>time:</strong> ${booking.time}</div>
                    <button class="buttons" onclick="onEditButtonPressed('${booking._id}')">Edit</button>
                </div>
            </div>`
            }
        }
    })
}

function isTodayOrFutureDate(dateString) {
    // Parse the date string as yyyy/mm/dd
    const inputDate = new Date(dateString);
    const today = new Date();

    // Set both dates' time to midnight to compare only dates
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return inputDate >= today;
}

const render = {
    fromURL,
    allRooms,
    renderBookings
};

window.render = render;
