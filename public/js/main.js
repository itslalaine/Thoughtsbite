document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".deleteThoughtForm").forEach(form => {

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            Swal.fire({

                title: "Move to Trash?",
                text: "You can restore this reflection later from the Trash.",
                icon: "question",

                showCancelButton: true,

                confirmButtonText: "Yes, move it",
                cancelButtonText: "Cancel",

                confirmButtonColor: "#D97C7C",
                cancelButtonColor: "#6c757d",

                reverseButtons: true

            }).then((result) => {

                if (result.isConfirmed) {
                    form.submit();
                }

            });

        });

    });

});