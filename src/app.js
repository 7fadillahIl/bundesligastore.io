document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "FC Bayern München", img: "1.jpg", price: 500000 },
      { id: 2, name: "Borussia Dortmund", img: "2.jpeg", price: 500000 },
      { id: 5, name: "RB Leipzig", img: "6.jpeg", price: 450000 },
      { id: 6, name: "Bayern Leverkussen", img: "bayern.jpg", price: 400000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // Jika Belum ada
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // Jika barang sudah ada
        this.items = this.items.map((item) => {
          // Jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // Jika barang Sudah Ada
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // Ambil item yang di remove
      const cariItem = this.items.find((item) => item.id === id);

      // Jika item lebih dari 1
      if (cariItem.quantity > 1) {
        // Telusuri 1 1
        this.items = this.items.map((item) => {
          // Jika Bukan barang yang di klik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // Jika barang sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// Form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  let allFilled = true;

  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.trim().length === 0) {
      allFilled = false;
      break; // Jika ada yang kosong, langsung hentikan pengecekan
    }
  }

  // Tambahkan atau hapus kelas 'disabled' berdasarkan kondisi allFilled
  checkoutButton.disabled = !allFilled;
  checkoutButton.classList.toggle("disabled", !allFilled);
});

//format pesan wa
const formatMessage = (obj) => {
  const items = JSON.parse(obj.items); // Ubah string menjadi array objek
  return `Data Customer
  Nama : ${obj.name}
  Email : ${obj.email}
  No HP : ${obj.phone}

  Data Pesanan
  ${items.map(
    (item) => `${item.nama} (${item.quantity} x ${rupiah(item.total)}) \n`
  )}
  
  TOTAL: ${rupiah(obj.total)}

  Terima Kasih.
  `;
};

// ...

//kirim data ketika tombol checkout di klik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  const objData = Object.fromEntries(data);
  // Ubah FormData menjadi objek langsung

  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    //console.log(token);
    window.snap.pay("token");
  } catch (err) {
    console.log(err.mesage);
  }
});

//...

// Convert ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
