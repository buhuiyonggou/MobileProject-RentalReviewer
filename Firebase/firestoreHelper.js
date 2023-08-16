import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { database } from "./firebase-setup";

const auth = getAuth();

// add a new review
export async function addReview(review) {
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = await addDoc(collection(database, "reviews"), {
        ...review,
        createdBy: user.uid,
      });
      return docRef;
    } catch (e) {
      console.error("Error adding post: ", e);
    }
  } else {
    console.error("User is not logged in");
  }
}

// add a new comment to selected review
export async function addComment(comment, reviewId) {
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = await addDoc(collection(database, "comments"), {
        ...comment,
        createdBy: user.uid,
        reviewId: reviewId,
        likes: 0,
        stampId: Date.now(),
      });
      console.log("Comment added with ID: ", docRef.id);
      // return docRef;
    } catch (e) {
      console.error("Error adding comment: ", e);
    }
  } else {
    console.error("User is not logged in");
  }
}

//add user to firestore while signing up
export async function addUser(user) {
  try {
    const docRef = await addDoc(collection(database, "users"), {
      ...user,
    });
    console.log("User added with ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error adding user: ", e);
  }
}
//update user info
export async function updateUser(userId, fieldToUpdate) {
  try {
    const userRef = doc(database, "users", userId);
    await updateDoc(userRef, {
      ...fieldToUpdate,
    });
    console.log("source: updateUser, firebaseHelper");
    return { status: "success", message: "User updated successfully!" };
  } catch (error) {
    console.error("Error updating user: ", error);
    return { status: "error", message: error.message };
  }
}

// update fields to review
export async function updateReview(reviewId, data) {
  try {
    const reviewRef = doc(database, "reviews", reviewId);
    // condition data is not empty
    await updateDoc(reviewRef, data);
    console.log("source: updateReview, firebaseHelper", data);
  } catch (error) {
    console.error("Error updating review: ", error);
  }
}

// update fields to comment
export async function updateComment(commentId, data) {
  try {
    const q = query(
      collection(database, "comments"),
      where("stampId", "==", commentId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const commentRef = querySnapshot.docs[0].ref;

      await updateDoc(commentRef, data);
      console.log("source: updateComment, firebaseHelper", data);
    } else {
      console.error(`No comment found with ID ${commentId}`);
    }
  } catch (error) {
    console.error(`Error updating comment with ID ${commentId}: `, error);
  }
}

export async function deleteCommentsForReview(reviewId) {
  try {
    const q = query(
      collection(database, "comments"),
      where("reviewId", "==", reviewId)
    );
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(database);

    querySnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });

    await batch.commit();
    console.log(
      "source: deleteCommentsForReview, firebaseHelper - All comments deleted"
    );
  } catch (error) {
    console.error("Error deleting comments for review: ", error);
  }
}

// delete a review
export async function deleteReview(reviewId) {
  try {
    await deleteCommentsForReview(reviewId);

    await deleteDoc(doc(database, "reviews", reviewId));
    console.log("source: deleteReview, firebaseHelper");
  } catch (error) {
    console.error("Error deleting review: ", error);
  }
}

// delete a comment
export async function deleteComment(stampId) {
  try {
    const q = query(
      collection(database, "comments"),
      where("stampId", "==", stampId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const commentRef = querySnapshot.docs[0].ref;
      await deleteDoc(commentRef);
      console.log(`Deleted comment with stampId: ${stampId}`);
    } else {
      console.error(`No comment found with stampId ${stampId}`);
    }
  } catch (error) {
    console.error(`Error deleting comment with stampId ${stampId}: `, error);
  }
}

// get review info
export async function getReviewInfo(reviewId) {
  console.log("Fetching review with ID:", reviewId);
  const docSnap = await getDoc(doc(database, "reviews", reviewId));
  if (docSnap.exists()) {
    return docSnap.data().location;
  } else {
    console.log("No such document!");
  }
}

// update review location
export async function saveReviewLocation(reviewId, location) {
  try {
    await setDoc(
      doc(database, "reviews", reviewId),
      { location },
      {
        merge: true,
      }
    );
  } catch (err) {
    console.log("Error saving review location ", err);
  }
}
