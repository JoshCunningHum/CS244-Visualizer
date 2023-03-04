class QuickSort{

    // Sort the first, middle, and last, then returns the last index
    static medianOfThree(arr){
        const values = arr.values,
              len = values.length,
              midIndex = Math.floor((len - 1)/2);

        let largest = 0;

        // find largest
        if(values[largest] < values[midIndex]) largest = midIndex;
        if(values[largest] < values[len - 1]) largest = len - 1;

        // swap the values at index largest with the last
        [values[largest], values[len - 1]] = [values[len - 1], values[largest]];

        if(values[largest] != values[len - 1]) arr.swap(largest, len - 1, false);

        // check the mid and first
        if(values[midIndex] < values[0]) arr.swap(0, midIndex, false);
        

        const p = arr.get(midIndex);

        // Change color of the pivot
        Handler.addAnimation((new Animation(() => {
            p.state = Human.state.PIVOT;
        }, 10, 0, 0)).togglePause());
        

        return midIndex;
    }

    static sort(arr){
        if(arr.length == 0) return; // If no items dugh
        if(arr.level == 0) arr.fixIndex().saveState();

        // Find median of three and sort
        const iPivot = this.medianOfThree(arr),
              pivot = arr.get(iPivot).value;

        // Terminating case
        if(arr.length <= 3){
            // set all items in the array as correct
            arr.forEach(item => {
                Handler.addAnimation(new Animation(() => {
                    item.state = Human.state.CORRECT;
                }, 10, 10, 0));
            })

            return;
        }

        // Swap again the mid and last so that pivot is in the last
        arr.swap(iPivot, arr.length - 1);

        let iLeft, iRight, i = 0;
        while(i++ < arr.length){

            iLeft = null, iRight = null;

            // find iRight and iLeft Items
            // TODO: Do the ray tracing animation here
            for(let i = 0; i < arr.length - 1; i++){
                const [l, r] = [arr.get(i).value, arr.get(arr.length - (i + 2)).value];
                if(iLeft == null && l > pivot) iLeft = i;
                if(iRight == null && r < pivot) iRight = arr.length - (i + 2);
                if(iRight && iLeft) break; // Found already the two
            }

            if(iLeft > iRight) break; // means that we found the position for the pivot

            // If no item from left found because pivot is already the smallest or equal to smallest
            if(iLeft == null){
                iLeft = arr.length - 1;
                break;
            }
            arr.swap(iLeft, iRight);
        }

        if(arr.get(iLeft) != arr.get(arr.length - 1))arr.swap(iLeft, arr.length - 1); // swap pivot with the item from left
        
        const t = arr.get(iLeft); // pivot, making it green
        Handler.addAnimation((new Animation(() => {
            t.state = Human.state.CORRECT;
        }, 10, 0, 0)).togglePause(), "pivot-go-green");

        // RECURSION PART
        const [left, mid, right] = arr.separate(iLeft),
               g = -HumanArray.recurse_gap;

        // For forwarding
        left.pos.add({z: -g});
        right.pos.add({z: -g});

        // console.log(left.values);
        
        // Set Right Indexes to TEMP (Gray Color)
        Handler.addAnimation(new Animation(() => {
            right.states = Human.state.TEMP;
        }, 10, 0, 0), "right-go-temp");

        // If left should have a sort check, then sort
        if(left.length > 1){
            // Make them go forward
            left.arrange();
            // Sort
            this.sort(left);
            // Once sorted, make its parent array order fixed
            left.fixParent();
            // Make them go backward
            left.pos.add({z: g});
            left.arrange();
        }

        // Make all left go green
        Handler.addAnimation(new Animation(() => {
            left.states = Human.state.CORRECT;
        }, 10, 0, 0), "left-go-green");


        // Unset right indexes that was set to temp to undetermined
        Handler.addAnimation(new Animation(() => {
            right.states = Human.state.UNDETERMINED;
        }), 10, 0, 0);
        
        // If right should have a sort check, then sort
        if(right.length > 1){
            // Make them go forward
            right.arrange();
            // Sort
            this.sort(right); 
            // Once sorted, make its parent array order fixed
            right.fixParent();
            // Make them go backward
            right.pos.add({z: g});
            right.arrange();
        }

        // Make them all go green
        right.forEach(item => {
            Handler.addAnimation(new Animation(() => {
                item.state = Human.state.CORRECT;
            }, 10, 0, 0));
        })
    }
}