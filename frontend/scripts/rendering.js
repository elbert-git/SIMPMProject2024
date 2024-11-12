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

function renderOneRoomForAdmin(price, roomCapacity, roomName, id, isActive) {
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
        <button class="buttons room-edit-button" onclick="onEditButtonClicked('${id}')"> Edit </button>
      </div>
    </div>
    `;
}

async function allRooms(parentElement, onlyActive = false) {
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
        // render elements
        res.rooms.forEach((roomData) => {
            // if (roomData.isActive) {
            parentElement.innerHTML += renderOneRoomForAdmin(
                roomData.pricePerHour,
                roomData.roomCapacity,
                roomData.roomName,
                roomData.roomId,
                roomData.isActive
            );
            // }
        });
    } catch (error) {
        console.log(error);
    }
}

const render = {
    fromURL,
    allRooms,
};

window.render = render;
