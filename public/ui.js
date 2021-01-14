let drawNumbers = () => {
    let numContainer = document.createElement('div');
    numContainer.id = "num-container";
    for (let i = 1; i <= 9; i++) {
        let num = document.createElement('div');
        num.classList.add('btn-special');
        num.innerHTML = i;
        num.onclick = () => setNumber(i);
        numContainer.appendChild(num);
    }

    document.getElementById('container').appendChild(numContainer);
}

drawNumbers();