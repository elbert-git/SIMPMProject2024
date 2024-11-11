//   <p><strong>From:</strong> <input type="date" id="from-date" /></p>
//   <p><strong>To:</strong> <input type="date" id="to-date" /></p>
function renderOneRoom(price, roomCapacity, roomName, id) {
    return `
    <div class="details-container">
      <div class="room-image">
        <img src="./assets/meetingRoom.jpg" alt="Room Image" />
      </div>

      <div class="booking-info">
        <h2 id="room-name">${roomName}</h2>

        <div>
          <p><strong>Capacity:</strong> <span id="max-count">${roomCapacity}</span></p>
        </div>

        <div class="amount">
          <p>
            <strong>Rent per Day:</strong> $<span id="rent-per-day">${price}</span>
          </p>
        </div>

        <button class="buttons room-edit-button" onclick="onEditButtonClicked('${id}')"> Edit </button>
      </div>
    </div>
    `
}

async function renderAllRooms(parentElement, onlyActive = false) {
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
        `
        // get data
        const res = await auth.getAllRooms()
        console.log(res)
        // render elements
        res.rooms.forEach(roomData => {
            // if (roomData.isActive) {
            parentElement.innerHTML += renderOneRoom(roomData.pricePerHour, roomData.roomCapacity, roomData.roomName, roomData.roomId)
            // }
        });
    } catch (error) {
        console.log(error)
    }
}